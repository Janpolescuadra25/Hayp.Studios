'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Instagram } from 'lucide-react';
import type { InstagramMediaItem } from '@/app/api/instagram/route';

export function HaypInstagramFeed() {
  const [posts, setPosts] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('loading');

  useEffect(() => {
    let isMounted = true;
    async function loadFeed() {
      try {
        const res = await fetch('/api/instagram');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setPosts(json.data || []);
            setSource(json.source || 'fallback');
          }
        }
      } catch (err) {
        console.error('Error fetching Instagram feed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeed();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full py-12 border-t border-border/50 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-wider uppercase mb-1">
              <Instagram className="w-4 h-4" />
              <span>Studio Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Recent Visual Experiments
            </h2>
          </div>
          <a
            href="https://instagram.com/haypstudios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/50 text-sm font-medium transition-colors"
          >
            <span>@haypstudios</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mb-4 flex justify-end">
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {source === 'live' ? 'Live feed' : source === 'fallback' ? 'Fallback feed' : 'Loading feed'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-muted/20 hover:border-primary/60 transition-all duration-300"
              >
                <Image
                  src={post.media_url}
                  alt={post.caption || 'Hayp Studios visual post'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <p className="text-xs text-foreground line-clamp-2 font-medium">
                    {post.caption}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}