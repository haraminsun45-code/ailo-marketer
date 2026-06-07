"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RecordTypeSelector } from "@/components/record/RecordTypeSelector";

export default function RecordPage() {
  const router = useRouter();

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로가기"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-mint-100"
      >
        <ArrowLeft size={22} />
      </button>
      <header className="mt-7">
        <h1 className="text-3xl font-black text-slate-900">순간 남기기</h1>
        <p className="mt-3 text-lg font-semibold text-slate-500">
          오늘의 나를 어떻게 남길까요?
        </p>
      </header>
      <RecordTypeSelector />
    </AppShell>
  );
}
