"use client";

import { Bell, Sparkles } from "lucide-react";

export function HomeHeader() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[44px] font-black leading-none tracking-normal text-[#123f3b]">
            요즘의 나
          </h1>
          <Sparkles className="mt-1 text-[#8bd3ca]" size={28} fill="#8bd3ca" />
        </div>
        <p className="mt-4 text-[22px] font-medium leading-7 text-[#7b8584]">
          기록하면, 내가 보여요
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.alert("알림 기능은 다음 단계에서 준비할 예정이에요.")}
        aria-label="알림"
        className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e7eeee] bg-white text-slate-700 shadow-[0_10px_26px_rgba(18,63,59,0.06)]"
      >
        <Bell size={24} />
      </button>
    </header>
  );
}
