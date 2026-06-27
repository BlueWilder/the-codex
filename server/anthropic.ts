import Anthropic from '@anthropic-ai/sdk';

// Vision-capable Claude model used to read characters off a photographed script.
// Pinned to a dated release for stability; the older "claude-sonnet-4-20250514"
// was retired and started returning 404 not_found_error from the API.
const DEFAULT_MODEL_STR = "claude-sonnet-4-5-20250929";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export interface ScanScriptResult {
  names: string[];
}

// A script can't realistically contain more than this many distinct characters.
// Caps pathological model output before it ever reaches the client.
const MAX_RETURNED_NAMES = 60;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Reads a photo of a printed Blood on the Clocktower script and returns the
 * list of character names it recognizes, constrained to the provided list of
 * valid names. Claude does the OCR and the fuzzy mapping in a single step.
 */
export async function scanScriptImage(
  base64Image: string,
  mediaType: SupportedMediaType,
  validNames: string[],
): Promise<ScanScriptResult> {
  const response = await anthropic.messages.create({
    // "claude-sonnet-4-20250514"
    model: DEFAULT_MODEL_STR,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              `This image is a printed Blood on the Clocktower script (a list of character names, often with token artwork and stylized fonts).\n\n` +
              `Here is the complete list of VALID character names you may choose from:\n${validNames.join(", ")}\n\n` +
              `Read the image and identify which of these valid characters appear on the script. ` +
              `Match what you see to the closest valid name from the list above, correcting for OCR/font issues. ` +
              `Only include names from the valid list. Do not invent characters or include any name that is not on the list.\n\n` +
              `Respond with ONLY a JSON object of the exact shape {"names": ["Name1", "Name2", ...]} using the exact spellings from the valid list. No commentary, no markdown.`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
        ],
      },
    ],
  });

  const block = response.content[0];
  const text = block && block.type === "text" ? block.text : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    throw new Error("Could not understand the scan result. Please try a clearer photo.");
  }

  const rawNames = Array.isArray((parsed as { names?: unknown })?.names)
    ? ((parsed as { names: unknown[] }).names.filter((n) => typeof n === "string") as string[])
    : [];

  // Hard server-side allowlist: regardless of what the model returns, only
  // names that map to a real character are allowed through. This keeps the
  // endpoint from being abused as a general-purpose OCR/extraction tool.
  const allowed = new Map<string, string>();
  validNames.forEach((n) => allowed.set(normalizeName(n), n));

  const seen = new Set<string>();
  const names: string[] = [];
  for (const raw of rawNames) {
    const canonical = allowed.get(normalizeName(raw));
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical);
      names.push(canonical);
      if (names.length >= MAX_RETURNED_NAMES) break;
    }
  }

  return { names };
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}
