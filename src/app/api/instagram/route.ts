import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';

export interface InstagramMediaItem {
  id: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
}

const FALLBACK_INSTAGRAM_POSTS: InstagramMediaItem[] = [
  {
    id: 'hayp-ig-1',
    caption: 'Kinetic typography & brand identity for NeoVibe Studios. #design #branding',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/haypstudios',
    timestamp: '2026-10-08T14:30:00Z',
  },
  {
    id: 'hayp-ig-2',
    caption: 'Spatial soundscapes & 3D motion exploratory reels. #3d #motion #audio',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/haypstudios',
    timestamp: '2026-10-05T09:15:00Z',
  },
  {
    id: 'hayp-ig-3',
    caption: 'Behind the scenes at the Hayp creative laboratory. #studio #behindthescenes',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/haypstudios',
    timestamp: '2026-10-02T18:00:00Z',
  },
  {
    id: 'hayp-ig-4',
    caption: 'Interactive web installations crafted for avant-garde creators. #webdesign #interactive',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
    permalink: 'https://instagram.com/haypstudios',
    timestamp: '2026-09-28T11:45:00Z',
  },
];

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      message: 'Running in simulation mode (no INSTAGRAM_ACCESS_TOKEN configured)',
      data: FALLBACK_INSTAGRAM_POSTS,
    });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.warn('Instagram API responded with error, utilizing fallback feed.');
      return NextResponse.json({
        source: 'fallback',
        message: 'Instagram upstream error; serving cached fallback',
        data: FALLBACK_INSTAGRAM_POSTS,
      });
    }

    const json = await response.json();
    return NextResponse.json({
      source: 'live',
      data: Array.isArray(json?.data) ? json.data : FALLBACK_INSTAGRAM_POSTS,
    });
  } catch (error) {
    logger.error("Instagram general error", 'Failed to query Instagram API:', error, "InstagramAPI");
    return NextResponse.json({
      source: 'fallback',
      message: 'Network exception; serving fallback data',
      data: FALLBACK_INSTAGRAM_POSTS,
    });
  }
}
