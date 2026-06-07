import { AppShell } from "@/components/layout/AppShell";

export default function MePage() {
  return (
    <AppShell>
      <header>
        <p className="text-sm font-bold text-mint-600">준비 중</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">나</h1>
      </header>
      <section className="mt-8 rounded-[28px] border border-mint-100 bg-white p-6 shadow-soft">
        <p className="text-lg font-bold leading-8 text-slate-800">
          내 정보와 설정 화면은 /profile에서 확인할 수 있어요.
        </p>
      </section>
    </AppShell>
  );
}
