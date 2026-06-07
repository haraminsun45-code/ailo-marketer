import Image from "next/image";
import { MemoryFragment } from "@/components/silhouette/MemoryFragment";
import type { Moment } from "@/lib/types";

type SilhouetteMemoryViewProps = {
  moments: Moment[];
};

const positions = [
  "left-14 top-16",
  "right-12 top-24",
  "left-8 top-40",
  "right-8 top-48",
  "left-16 bottom-24",
  "right-16 bottom-16"
];

export function SilhouetteMemoryView({ moments }: SilhouetteMemoryViewProps) {
  const fragments = moments.slice(0, 6);

  return (
    <section className="relative mx-auto mt-5 h-[340px] w-full max-w-[310px]">
      <Image
        src="/silhouette.svg"
        alt="기록 조각으로 채워지는 사람 실루엣"
        fill
        priority
        className="object-contain"
      />
      <div className="absolute inset-0">
        {fragments.map((moment, index) => (
          <MemoryFragment
            key={moment.id}
            type={moment.type}
            label={moment.type === "photo" ? moment.imageLabel ?? "사진" : moment.content}
            className={positions[index]}
          />
        ))}
      </div>
    </section>
  );
}
