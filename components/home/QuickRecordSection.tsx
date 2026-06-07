"use client";

import Link from "next/link";
import { Camera, Mic, Pencil, Sparkles } from "lucide-react";

export function QuickRecordSection() {
  return (
    <section className="mt-9">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#55b9ad]" size={24} fill="#55b9ad" />
          <h2 className="text-[25px] font-black tracking-normal text-[#123f3b]">오늘의 기록</h2>
        </div>
        <p className="max-w-[170px] text-right text-sm font-medium leading-6 text-[#7b8584]">
          지금 이 순간도, 소중한 나의 이야기예요.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/record/photo"
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-[22px] border border-[#dfe9e7] bg-white text-[#123f3b] shadow-[0_12px_30px_rgba(18,63,59,0.06)]"
        >
          <Camera className="text-[#55b9ad]" size={32} strokeWidth={2.4} />
          <span className="text-lg font-bold">사진</span>
        </Link>
        <Link
          href="/record/voice"
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-[22px] border border-[#dfe9e7] bg-white text-[#123f3b] shadow-[0_12px_30px_rgba(18,63,59,0.06)]"
        >
          <Mic className="text-[#55b9ad]" size={32} strokeWidth={2.4} />
          <span className="text-lg font-bold">음성</span>
        </Link>
        <Link
          href="/record/text"
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-[22px] border border-[#dfe9e7] bg-white text-[#123f3b] shadow-[0_12px_30px_rgba(18,63,59,0.06)]"
        >
          <Pencil className="text-[#55b9ad]" size={32} strokeWidth={2.4} />
          <span className="text-lg font-bold">글</span>
        </Link>
      </div>
    </section>
  );
}
