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
  codeBlocks: CodeBlock[];
  notes?: string;
  snippetType?: SnippetType;
  category: string;
  project?: string;     // optioneel — Fase H1, zie docs/audit-hierarchie.md
  component?: string;   // optioneel — Fase H1, onderdeel binnen project
  tags: string[];
  favorite: boolean;
  archived?: boolean;   // legacy — wordt uitgefaseerd, zie deletedAt
  deletedAt?: string;   // ISO timestamp — soft-delete, zie docs/design-baseline-v2.md sectie 10.3
  createdAt?: string;
  updatedAt?: string;
}
