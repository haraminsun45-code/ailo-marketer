import { AppShell } from "@/components/layout/AppShell";
import { HeroImageCard } from "@/components/home/HeroImageCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickRecordSection } from "@/components/home/QuickRecordSection";

export default function HomePage() {
  return (
    <AppShell>
      <HomeHeader />
      <HeroImageCard />
      <QuickRecordSection />
    </AppShell>
  );
}
