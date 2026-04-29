export type SnippetType = "code" | "prompt" | "instructie";

export interface CodeBlock {
  id: string;
  filename: string;
  code: string;
}

export interface Snippet {
  id?: string;
  title: string;
  description: string;
  code: string;
  codeBlocks?: CodeBlock[];
  notes?: string;
  snippetType?: SnippetType;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}
