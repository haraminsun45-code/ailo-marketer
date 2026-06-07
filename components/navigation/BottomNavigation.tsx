"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleUserRound, Home, Plus, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "요즘의 나", icon: Home },
  { href: "/moments", label: "순간들", icon: BookOpen },
  { href: "/insights", label: "발견", icon: Sparkles },
  { href: "/profile", label: "나", icon: CircleUserRound }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-[#e7eeee] bg-white/95 px-4 pb-5 pt-3 shadow-[0_-12px_35px_rgba(42,79,70,0.08)] backdrop-blur">
      <div className="grid grid-cols-[1fr_1fr_76px_1fr_1fr] items-end gap-1">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                active ? "text-mint-600" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/record"
          aria-label="기록하기"
          className="mx-auto -mt-9 flex h-16 w-16 items-center justify-center rounded-full bg-[#55b9ad] text-white shadow-[0_16px_32px_rgba(85,185,173,0.36)] ring-8 ring-white"
        >
          <Plus size={32} strokeWidth={2.8} />
        </Link>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                active ? "text-mint-600" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
