import { ImageIcon, MessageCircle, Waves } from "lucide-react";
import type { Moment } from "@/lib/types";

type MomentCardProps = {
  moment: Moment;
};

const cardTone = {
  photo: "border-emerald-100 bg-emerald-50/70",
  voice: "border-sky-100 bg-sky-50/70",
  text: "border-amber-100 bg-amber-50/70"
};

const label = {
  photo: "사진 기록",
  voice: "음성 기록",
  text: "글 기록"
};

export function MomentCard({ moment }: MomentCardProps) {
  const Icon = moment.type === "photo" ? ImageIcon : moment.type === "voice" ? Waves : MessageCircle;

  return (
    <article className={`rounded-[24px] border p-4 ${cardTone[moment.type]}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-mint-600 shadow-sm">
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-500">{label[moment.type]}</p>
            <time className="shrink-0 text-[11px] font-medium text-slate-400">
              {formatDate(moment.createdAt)}
            </time>
          </div>
          <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-800">
            {moment.content}
          </p>
          {moment.type === "voice" ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 items-end gap-1 rounded-full bg-white px-3 py-1.5">
                {[8, 14, 9, 17, 11, 15, 7].map((height, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-sky-300"
                    style={{ height }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-500">{moment.duration}</span>
            </div>
          ) : null}
          {moment.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {moment.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}
