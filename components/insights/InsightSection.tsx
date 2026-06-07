import { Check, HelpCircle, X } from "lucide-react";
import type { Insight } from "@/lib/types";

type InsightSectionProps = {
  insight: Insight;
};

export function InsightSection({ insight }: InsightSectionProps) {
  return (
    <article className="rounded-[28px] border border-[#e7eeee] bg-white p-5 shadow-[0_14px_34px_rgba(18,63,59,0.07)]">
      <p className="text-sm font-bold text-[#55b9ad]">{insight.title}</p>
      <p className="mt-3 text-lg font-bold leading-8 text-[#123f3b]">{insight.description}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-1 rounded-2xl bg-[#eaf7f4] px-2 py-3 text-xs font-bold text-[#24988b]">
          <Check size={15} />
          맞아요
        </button>
        <button className="flex items-center justify-center gap-1 rounded-2xl bg-slate-50 px-2 py-3 text-xs font-bold text-slate-500">
          <HelpCircle size={15} />
          모르겠어요
        </button>
        <button className="flex items-center justify-center gap-1 rounded-2xl bg-slate-50 px-2 py-3 text-xs font-bold text-slate-500">
          <X size={15} />
          아니에요
        </button>
      </div>
    </article>
  );
}
