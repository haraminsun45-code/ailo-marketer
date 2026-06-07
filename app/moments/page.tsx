import { AppShell } from "@/components/layout/AppShell";
import { MomentsTimeline } from "@/components/moments/MomentsTimeline";

export default function MomentsPage() {
  return (
    <AppShell>
      <header>
        <p className="text-sm font-bold text-mint-600">쌓인 기록 조각</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">나의 순간들</h1>
      </header>
      <MomentsTimeline />
    </AppShell>
  );
}
