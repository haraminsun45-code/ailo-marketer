"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function PhotoRecordPage() {
  const router = useRouter();

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로가기"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-[#e7eeee]"
      >
        <ArrowLeft size={22} />
      </button>
      <section className="mt-8 rounded-[30px] border border-[#e7eeee] bg-white p-7 text-center shadow-[0_14px_34px_rgba(18,63,59,0.07)]">
        <Camera className="mx-auto text-[#55b9ad]" size={48} />
        <h1 className="mt-5 text-2xl font-black text-[#123f3b]">사진 기록</h1>
        <p className="mt-4 text-lg font-semibold leading-8 text-[#7b8584]">
          사진 기록 기능은 준비하고 있어요.
        </p>
      </section>
    </AppShell>
  );
}
