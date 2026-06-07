import { AppShell } from "@/components/layout/AppShell";
import { InsightSection } from "@/components/insights/InsightSection";
import { mockInsights } from "@/data/mockInsights";

export default function InsightsPage() {
  return (
    <AppShell>
      <header>
        <p className="text-sm font-bold text-[#55b9ad]">더미 분석 결과</p>
        <h1 className="mt-2 text-3xl font-black text-[#123f3b]">발견</h1>
        <p className="mt-3 text-base font-medium leading-7 text-[#7b8584]">
          아직 실제 AI 분석은 연결하지 않았어요. MVP에서는 예시 발견 카드로 흐름만 확인합니다.
        </p>
      </header>
      <section className="mt-7 space-y-4">
        {mockInsights.map((insight) => (
          <InsightSection key={insight.id} insight={insight} />
        ))}
      </section>
    </AppShell>
  );
}
