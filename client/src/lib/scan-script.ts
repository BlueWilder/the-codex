import { ALL_CHARACTERS } from "@/lib/game-data";
import { apiRequest } from "@/lib/queryClient";

export interface ScanMatchResult {
  matchedIds: string[];
  unmatchedNames: string[];
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const nameLookup: Map<string, string> = (() => {
  const map = new Map<string, string>();
  ALL_CHARACTERS.forEach((c) => {
    map.set(normalizeName(c.name), c.id);
    map.set(normalizeName(c.id), c.id);
  });
  return map;
})();

/**
 * Loads an image file, downscales it, and re-encodes as JPEG base64.
 * Keeps the payload small and ensures a media type Claude accepts.
 */
async function prepareImage(file: File): Promise<{ data: string; mediaType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be opened. Try a JPEG or PNG."));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(img, 0, 0, width, height);

  const jpegDataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = jpegDataUrl.split(",")[1] ?? "";
  if (!base64) throw new Error("Could not process that image.");

  return { data: base64, mediaType: "image/jpeg" };
}

function matchNames(names: string[]): ScanMatchResult {
  const matched: string[] = [];
  const unmatched: string[] = [];
  for (const name of names) {
    const id = nameLookup.get(normalizeName(name));
    if (id) {
      matched.push(id);
    } else {
      unmatched.push(name);
    }
  }
  return { matchedIds: Array.from(new Set(matched)), unmatchedNames: unmatched };
}

/**
 * Sends a photo of a printed script to the backend, where Claude reads it,
 * then maps the recognized names to the app's character IDs.
 */
export async function scanScriptFile(file: File): Promise<ScanMatchResult> {
  const { data, mediaType } = await prepareImage(file);

  let res: Response;
  try {
    res = await apiRequest("POST", "/api/scan-script", {
      image: data,
      mediaType,
    });
  } catch (err) {
    throw new Error(extractApiError(err));
  }
  const body = (await res.json()) as { names?: string[] };
  const names = Array.isArray(body.names) ? body.names : [];
  return matchNames(names);
}

function extractApiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const match = raw.match(/^\d+:\s*([\s\S]*)$/);
  const payload = match ? match[1] : raw;
  try {
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed.message === "string") return parsed.message;
  } catch {
    // not JSON, fall through
  }
  return payload || "Could not scan the script. Please try again.";
}
