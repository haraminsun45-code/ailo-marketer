import { BottomNavigation } from "@/components/navigation/BottomNavigation";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fbfdfb] pb-28 shadow-[0_0_80px_rgba(18,63,59,0.06)]">
      <main className="px-6 pb-8 pt-8">{children}</main>
      <BottomNavigation />
    </div>
  );
}
