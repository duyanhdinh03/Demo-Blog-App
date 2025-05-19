export interface User {
  id?: number;
  username: string;
  password?: string;
  email: string;
  createdAt?: Date;
  address?: string;
  avatarUrl?: string;
  fullName?: string;
}

export interface UserProfile {
  username: string;
  email: string;
  role: string;
  avatarUrl?: string; 
}

export interface SettingsDTO {
  postsPerPage: number;
  homepagePreference: string;
}