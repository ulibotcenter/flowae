import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyButton({
  text,
  label = "Copiar",
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setDone(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={onCopy}>
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {label}
    </Button>
  );
}
