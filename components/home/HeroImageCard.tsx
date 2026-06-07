import Image from "next/image";
import Link from "next/link";
import { ChartNoAxesCombined, Sparkles } from "lucide-react";

const heroMessage = ["남겨둔 기록들이", "지금의 나를", "만들어가고 있어요."].join("\n");

export function HeroImageCard() {
  return (
    <section className="mt-10 overflow-hidden rounded-[34px] border border-white bg-white shadow-[0_22px_54px_rgba(18,63,59,0.12)] ring-1 ring-[#e7eeee]">
      <div className="relative min-h-[620px] px-7 pb-7 pt-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,#eaf7f4_0%,#fbfdfb_42%,#fff_100%)]" />
        <div className="relative z-10 max-w-[190px]">
          <Sparkles className="mb-7 text-[#55b9ad]" size={38} fill="#55b9ad" />
          <p className="whitespace-pre-line text-[32px] font-black leading-[1.55] tracking-normal text-[#123f3b]">
            {heroMessage}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-[86px] top-[110px]">
          <Image
            src="/images/home-silhouette-hero.png"
            alt="기록 조각이 담긴 사람 실루엣"
            fill
            priority
            sizes="430px"
            className="object-contain object-bottom"
          />
        </div>
        <Link
          href="/insights"
          className="absolute inset-x-7 bottom-7 z-10 flex h-16 items-center justify-center gap-3 rounded-[22px] border border-[#d7e8e5] bg-white/88 text-[21px] font-bold text-[#24988b] shadow-[0_12px_28px_rgba(18,63,59,0.08)] backdrop-blur"
        >
          <ChartNoAxesCombined size={26} />
          나의 흐름 보기
        </Link>
      </div>
    </section>
  );
}
