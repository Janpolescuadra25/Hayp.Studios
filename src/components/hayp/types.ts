export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediaType: string;
  caption?: string | null;
  displayOrder: number;
}

export interface ArtistSnippet {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  tags?: string[] | null;
  isActive?: boolean;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: number | null;
  tags?: string[] | string | null;
  category?: string | null;
  isFeatured: boolean;
  isArchived?: boolean;
  featured?: boolean;
  displayOrder: number;
  artistId?: string | null;
  artist?: ArtistSnippet | null;
  media: MediaItem[];
}
