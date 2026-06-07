import { ImageIcon, Quote, Waves } from "lucide-react";
import type { MomentType } from "@/lib/types";

type MemoryFragmentProps = {
  type: MomentType;
  label: string;
  className?: string;
};

export function MemoryFragment({ type, label, className = "" }: MemoryFragmentProps) {
  const Icon = type === "photo" ? ImageIcon : type === "voice" ? Waves : Quote;

  return (
    <div
      className={`fade-in absolute rounded-2xl border border-white/80 bg-white/90 p-2 text-[10px] font-semibold text-slate-600 shadow-soft ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-mint-500" />
        <span className="max-w-[62px] truncate">{label}</span>
      </div>
      {type === "voice" ? (
        <div className="mt-1 flex h-5 items-end gap-0.5">
          {[8, 14, 10, 18, 12, 16].map((height, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-mint-300"
              style={{ height }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
