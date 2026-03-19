export interface Tag {
  id: string;
  name: string;
  emoji: string;
  color: string;
  userId: string;
  createdAt: any;
}

export interface CreateTagInput {
  name: string;
  emoji?: string;
  color?: string;
}
