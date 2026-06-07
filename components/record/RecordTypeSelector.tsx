"use client";

import Link from "next/link";
import { ImageIcon, MessageCircle, Waves } from "lucide-react";

export function RecordTypeSelector() {
  return (
    <div className="mt-7 grid gap-3">
      <Link
        href="/record/photo"
        className="flex items-center gap-4 rounded-[26px] border border-mint-100 bg-white p-5 text-left shadow-soft"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-mint-600">
          <ImageIcon size={25} />
        </span>
        <span>
          <span className="block text-lg font-bold text-slate-800">사진</span>
          <span className="mt-1 block text-sm text-slate-500">장면 하나를 남겨요</span>
        </span>
      </Link>
      <Link
        href="/record/voice"
        className="flex items-center gap-4 rounded-[26px] border border-mint-100 bg-white p-5 text-left shadow-soft"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
          <Waves size={25} />
        </span>
        <span>
          <span className="block text-lg font-bold text-slate-800">음성</span>
          <span className="mt-1 block text-sm text-slate-500">목소리로 순간을 남겨요</span>
        </span>
      </Link>
      <Link
        href="/record/text"
        className="flex items-center gap-4 rounded-[26px] border border-mint-100 bg-white p-5 text-left shadow-soft"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <MessageCircle size={25} />
        </span>
        <span>
          <span className="block text-lg font-bold text-slate-800">한 줄</span>
          <span className="mt-1 block text-sm text-slate-500">짧은 문장으로 기록해요</span>
        </span>
      </Link>
    </div>
  );
}
