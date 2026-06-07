import { AppShell } from "@/components/layout/AppShell";

export default function ProfilePage() {
  return (
    <AppShell>
      <header>
        <p className="text-sm font-bold text-[#55b9ad]">준비 중</p>
        <h1 className="mt-2 text-3xl font-black text-[#123f3b]">나</h1>
      </header>
      <section className="mt-8 rounded-[28px] border border-[#e7eeee] bg-white p-6 shadow-[0_14px_34px_rgba(18,63,59,0.07)]">
        <p className="text-lg font-bold leading-8 text-[#123f3b]">
          설정, 알림 시간, 개인정보 안내, AI 연결 설정은 다음 단계에서 구현할 예정이에요.
        </p>
      </section>
    </AppShell>
  );
}
