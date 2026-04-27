export type SnippetType = "code" | "prompt" | "instructie";

export interface Snippet {
  id?: string;
  title: string;
  description: string;
  code: string;
  notes?: string;
  snippetType?: SnippetType;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}
