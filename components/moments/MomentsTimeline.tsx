"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredMoments } from "@/lib/storage";
import type { Moment, MomentType } from "@/lib/types";
import { MomentCard } from "@/components/moments/MomentCard";

const filters: Array<{ value: "all" | MomentType; label: string }> = [
  { value: "all", label: "전체" },
  { value: "photo", label: "사진" },
  { value: "voice", label: "음성" },
  { value: "text", label: "글" }
];

export function MomentsTimeline() {
  const [filter, setFilter] = useState<"all" | MomentType>("all");
  const [storedMoments, setStoredMoments] = useState<Moment[]>([]);

  useEffect(() => {
    setStoredMoments(getStoredMoments());
  }, []);

  const moments = useMemo(() => {
    return storedMoments
      .filter((moment) => filter === "all" || moment.type === filter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, storedMoments]);

  const hasAnyStoredMoment = storedMoments.length > 0;

  return (
    <section className="mt-6">
      <div className="sticky top-0 z-10 -mx-5 bg-[#fbfdfb]/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                filter === item.value
                  ? "bg-mint-500 text-white shadow-sm"
                  : "bg-white text-slate-500 ring-1 ring-mint-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {moments.length > 0 ? (
        <div className="mt-3 space-y-3">
          {moments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[28px] border border-mint-100 bg-white p-7 text-center shadow-soft">
          <p className="whitespace-pre-line text-lg font-bold leading-8 text-slate-700">
            {hasAnyStoredMoment
              ? "이 필터에 해당하는 순간이 없어요."
              : "아직 남겨둔 순간이 없어요.\n오늘의 나를 한 줄 남겨볼까요?"}
          </p>
        </div>
      )}
    </section>
  );
}
