export interface Comment {
  id?: number;
  content: string;
  createdAt?: Date;
  postedBy: string;
  postId?: number;
}