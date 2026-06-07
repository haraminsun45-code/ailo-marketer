"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTextMoment } from "@/lib/storage";

export function TextRecordForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("기억하고 싶은 순간을 한 줄로 남겨주세요.");
      return;
    }

    saveTextMoment(trimmed);
    router.push("/moments");
  }

  return (
    <div className="mt-7">
      <label htmlFor="moment" className="block text-xl font-bold leading-8 text-slate-800">
        오늘 기억하고 싶은 순간은 무엇인가요?
      </label>
      <textarea
        id="moment"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setError("");
        }}
        placeholder="예: 오늘은 아무 말 없이 걷는 시간이 좋았다."
        className="mt-5 min-h-44 w-full resize-none rounded-[28px] border border-mint-100 bg-white p-5 text-lg leading-8 text-slate-800 shadow-soft outline-none transition focus:border-mint-300 focus:ring-4 focus:ring-mint-100"
        maxLength={160}
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <p className="font-medium text-red-500">{error}</p>
        <p className="ml-auto text-slate-400">{content.length}/160</p>
      </div>
      <div className="mt-7 grid grid-cols-[1fr_1.5fr] gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border border-mint-100 bg-white py-4 text-base font-bold text-slate-500"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-2xl bg-mint-500 py-4 text-base font-bold text-white shadow-[0_12px_26px_rgba(47,176,146,0.28)]"
        >
          저장
        </button>
      </div>
    </div>
  );
}
