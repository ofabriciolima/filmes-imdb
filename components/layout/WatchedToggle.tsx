import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WatchedToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function WatchedToggle({ checked, onCheckedChange }: WatchedToggleProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2">
      <Label htmlFor="include-watched" className="text-xs text-muted-foreground sm:text-sm">
        Incluir filmes já vistos
      </Label>
      <Switch
        id="include-watched"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
