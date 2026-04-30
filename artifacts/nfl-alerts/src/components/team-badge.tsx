import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  abbreviation: string;
  primaryColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TeamBadge({ abbreviation, primaryColor, size = "md", className }: TeamBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded uppercase font-bold text-white shadow-sm ring-1 ring-white/10",
        size === "sm" && "h-6 w-8 text-[10px]",
        size === "md" && "h-8 w-12 text-xs",
        size === "lg" && "h-12 w-16 text-base",
        className
      )}
      style={{ backgroundColor: primaryColor || "#000000" }}
    >
      {abbreviation}
    </div>
  );
}
