export interface Post {
  id?: number;
  name: string;
  content: string;
  postedBy: string;
  img?: string;
  date?: string;
  likeCounts?: number;
  viewCounts?: number;
  tags?: Tag[];
  avatarUrl?: string;
  tagNames?: string;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface PostRequest {
  name: string;
  content: string;
  postedBy?: string;
  img?: string;
  tagNames?: string[];
}


export interface PostDTO {
  id: number;
  name: string;
  content: string;
  postedBy: string;
  img: string;
  date: string;
  likeCounts: number;
  viewCounts: number;
  tags: string[];
  status: string;
}

export interface PostSummary {
  id: number;
  name: string;
  postedBy: string;
  date: string;
  likeCounts: number;
  viewCounts: number;
  commentCount: number;
  status: string;
}