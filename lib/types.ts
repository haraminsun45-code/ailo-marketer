export type MomentType = "photo" | "voice" | "text";

export type Moment = {
  id: string;
  type: MomentType;
  content: string;
  createdAt: string;
  imageLabel?: string;
  duration?: string;
  tags?: string[];
};

export type InsightCategory =
  | "food"
  | "thought"
  | "happy_moment"
  | "difficult_moment"
  | "time_pattern";

export type Insight = {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  createdAt: string;
};
