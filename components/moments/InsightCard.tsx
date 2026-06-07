import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function InsightCard() {
  return (
    <section className="rounded-[28px] border border-mint-100 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold text-mint-600">최근 발견한 나</p>
      <p className="mt-3 text-lg font-semibold leading-7 text-slate-800">
        최근에는 혼자 조용히 쉬었던 순간을 자주 남기고 있어요.
      </p>
      <Link
        href="/moments"
        className="mt-4 inline-flex items-center gap-1 rounded-full bg-mint-50 px-4 py-2 text-sm font-bold text-mint-600"
      >
        발견 더 보기
        <ChevronRight size={16} />
      </Link>
    </section>
  );
}
