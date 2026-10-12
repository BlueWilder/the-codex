import { useRef, useState } from "react";
import { scanScriptFile } from "@/lib/scan-script";
import { useToast } from "@/hooks/use-toast";

/**
 * The paper-script photo scan, shared by the setup wizard and Home. Render a
 * hidden file input with `inputRef` and `onFileChange`, call `openPicker` to
 * start. When characters are recognized, `onScanned` receives them so the
 * caller can open the script builder to review; failures show a toast.
 */
export function useScriptScan(onScanned: (characterIds: Set<string>) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const openPicker = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setScanning(true);
    try {
      const { matchedIds, unmatchedNames } = await scanScriptFile(file);
      if (matchedIds.length === 0) {
        toast({
          title: "No characters recognized",
          description: "Couldn't read any characters from that photo. Try a clearer, well-lit shot.",
          variant: "destructive",
        });
        return;
      }
      onScanned(new Set(matchedIds));
      if (unmatchedNames.length > 0) {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: `Couldn't match: ${unmatchedNames.join(', ')}. Review and edit before saving.`,
        });
      } else {
        toast({
          title: `Found ${matchedIds.length} characters`,
          description: "Review and edit your scanned script before saving.",
        });
      }
    } catch (err) {
      toast({
        title: "Scan failed",
        description: err instanceof Error ? err.message : "Could not scan that photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  return { inputRef, scanning, openPicker, onFileChange };
}
