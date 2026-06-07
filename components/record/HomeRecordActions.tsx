"use client";

import Link from "next/link";
import { ImageIcon, MessageCircle, Waves } from "lucide-react";

export function HomeRecordActions() {
  const pendingMessage = "사진과 음성 기록은 다음 단계에서 연결할 예정이에요.";

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => window.alert(pendingMessage)}
          className="rounded-[24px] bg-white p-4 text-center shadow-soft ring-1 ring-mint-100"
        >
          <ImageIcon className="mx-auto text-mint-600" size={25} />
          <span className="mt-2 block text-sm font-bold text-slate-700">사진</span>
        </button>
        <button
          type="button"
          onClick={() => window.alert(pendingMessage)}
          className="rounded-[24px] bg-white p-4 text-center shadow-soft ring-1 ring-mint-100"
        >
          <Waves className="mx-auto text-sky-500" size={25} />
          <span className="mt-2 block text-sm font-bold text-slate-700">음성</span>
        </button>
        <Link
          href="/record/text"
          className="rounded-[24px] bg-white p-4 text-center shadow-soft ring-1 ring-mint-100"
        >
          <MessageCircle className="mx-auto text-amber-500" size={25} />
          <span className="mt-2 block text-sm font-bold text-slate-700">글</span>
        </Link>
      </div>
    </div>
  );
}
