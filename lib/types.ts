export interface Snippet {
  id?: string;
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}
