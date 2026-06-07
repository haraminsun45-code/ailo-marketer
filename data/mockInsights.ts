import type { Insight } from "@/lib/types";

export const mockInsights: Insight[] = [
  {
    id: "insight-food",
    category: "food",
    title: "자주 남긴 것",
    description: "최근에는 커피와 따뜻한 음료를 곁들인 순간을 자주 기록했어요.",
    createdAt: "2026-06-07T09:00:00.000Z"
  },
  {
    id: "insight-thought",
    category: "thought",
    title: "자주 등장한 생각",
    description: "시간이 부족하다는 생각이 반복되어 쉬고 싶다는 마음이 함께 보였어요.",
    createdAt: "2026-06-06T09:00:00.000Z"
  },
  {
    id: "insight-happy",
    category: "happy_moment",
    title: "기분이 좋았던 순간",
    description: "혼자 조용히 쉬었던 날에 편안하다는 표현을 많이 남겼어요.",
    createdAt: "2026-06-05T09:00:00.000Z"
  },
  {
    id: "insight-difficult",
    category: "difficult_moment",
    title: "힘들었던 순간",
    description: "퇴근길과 늦은 저녁에 잠깐 숨을 고르고 싶다는 기록이 있었어요.",
    createdAt: "2026-06-04T09:00:00.000Z"
  },
  {
    id: "insight-time",
    category: "time_pattern",
    title: "자주 기록한 시간대",
    description: "오후와 밤에 남긴 기록이 많아 하루를 마무리하며 돌아보는 흐름이 보여요.",
    createdAt: "2026-06-03T09:00:00.000Z"
  }
];
