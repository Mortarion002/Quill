export interface Page {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "image"
  | "code"
  | "quote"
  | "todo"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
}
