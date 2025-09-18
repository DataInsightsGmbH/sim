import type { LucideIcon } from "lucide-react";

export function IconSwitch({
  checked,
  onChange,
  disabled = false,
  className = "",
  iconChecked: IconChecked,
  iconNotChecked: IconNotChecked,
  color = [107, 114, 128], // default gray color
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  iconChecked: LucideIcon;
  iconNotChecked: LucideIcon;
  color?: number[];
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex justify-around px-1 h-8 w-14 items-center rounded-md transition-colors
        focus:outline-none
        ${checked ? "" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      style={{
        backgroundColor: checked ? `rgb(${color.join(",")})` : undefined,
      }}
    >
      <div
        className={`
          absolute h-6 w-6 transform rounded-md bg-white transition-transform
            ${checked ? "translate-x-1/2" : "-translate-x-1/2"}
        `}
      />
      <IconChecked
        className="w-4 h-4 z-10"
        color={!checked ? `rgb(${color.join(",")})` : "#9CA3AF"}
      />
      <IconNotChecked
        className="w-4 h-4 z-10"
        color={checked ? `rgb(${color.join(",")})` : "#9CA3AF"}
      />
    </button>
  );
}