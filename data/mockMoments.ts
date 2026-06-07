import type { Moment } from "@/lib/types";

export const mockMoments: Moment[] = [
  {
    id: "mock-photo-1",
    type: "photo",
    content: "창가에 놓인 컵과 조용한 오후",
    createdAt: "2026-06-07T08:30:00.000Z",
    imageLabel: "햇빛",
    tags: ["휴식", "집"]
  },
  {
    id: "mock-voice-1",
    type: "voice",
    content: "퇴근길에 잠깐 숨을 고르고 싶었다는 기록",
    createdAt: "2026-06-06T18:20:00.000Z",
    duration: "00:18",
    tags: ["퇴근", "조용함"]
  },
  {
    id: "mock-text-1",
    type: "text",
    content: "오늘은 혼자 있는 시간이 생각보다 편했다.",
    createdAt: "2026-06-05T21:15:00.000Z",
    tags: ["혼자", "편안함"]
  },
  {
    id: "mock-photo-2",
    type: "photo",
    content: "산책하다 본 민트색 간판",
    createdAt: "2026-06-04T12:10:00.000Z",
    imageLabel: "산책",
    tags: ["밖", "산책"]
  }
];
