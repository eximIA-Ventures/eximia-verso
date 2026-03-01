"use client";

import { useState } from "react";
import Image from "next/image";
import { Linkedin, Twitter, Globe, Mail, ChevronDown } from "lucide-react";
import type { Author } from "@/lib/types";

const SOCIAL_ICONS: Record<string, typeof Globe> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  website: Globe,
  email: Mail,
};

function AuthorAvatar({ author, size = 40 }: { author: Author; size?: number }) {
  const initials = author.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (author.avatarUrl) {
    return (
      <Image
        src={author.avatarUrl}
        alt={author.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function AuthorProfile({ author }: { author: Author }) {
  const socialEntries = Object.entries(author.socialLinks).filter(
    ([, url]) => url
  );

  return (
    <div className="flex gap-4 rounded-xl border border-border/50 bg-surface/50 p-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <AuthorAvatar author={author} size={56} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-primary">
          {author.name}
        </p>
        {author.role && author.role !== "author" && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent/80">
            {author.role}
          </p>
        )}
        {author.bio && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {author.bio}
          </p>
        )}
        {socialEntries.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {socialEntries.map(([platform, url]) => {
              const Icon = SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
              const href = platform.toLowerCase() === "email"
                ? `mailto:${url}`
                : url;
              return (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-elevated hover:text-primary"
                  title={platform}
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Inline author display for article header — click to expand profile */
export function AuthorCard({ authors }: { authors: Author[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (authors.length === 0) return null;

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (authors.length === 1) {
    const author = authors[0];
    return (
      <div>
        <button
          onClick={() => toggle(author.id)}
          className="flex items-center gap-3 rounded-lg px-1 py-0.5 -mx-1 transition-colors hover:bg-elevated/50 cursor-pointer text-left"
        >
          <AuthorAvatar author={author} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">{author.name}</p>
            {author.bio && (
              <p className="truncate text-xs text-muted max-w-md">
                {author.bio}
              </p>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-muted transition-transform duration-200 ${
              expandedId === author.id ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedId === author.id && <AuthorProfile author={author} />}
      </div>
    );
  }

  // Multi-author
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {authors.map((author) => (
            <div key={author.id} className="ring-2 ring-bg rounded-full">
              <AuthorAvatar author={author} size={36} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-1.5 text-sm text-primary">
          {authors.map((author, i) => (
            <span key={author.id}>
              <button
                onClick={() => toggle(author.id)}
                className="font-medium underline decoration-border underline-offset-2 transition-colors hover:text-accent hover:decoration-accent cursor-pointer"
              >
                {author.name}
              </button>
              {i < authors.length - 1 && <span className="text-muted">,</span>}
            </span>
          ))}
        </div>
      </div>
      {authors.map(
        (author) =>
          expandedId === author.id && (
            <AuthorProfile key={author.id} author={author} />
          )
      )}
    </div>
  );
}

/** Small avatar for article cards in listings */
export function AuthorAvatarSmall({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  if (authors.length === 1) {
    return (
      <div className="flex items-center gap-1.5">
        <AuthorAvatar author={authors[0]} size={20} />
        <span className="text-xs text-muted">{authors[0].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {authors.slice(0, 3).map((author) => (
          <div key={author.id} className="ring-1 ring-surface rounded-full">
            <AuthorAvatar author={author} size={20} />
          </div>
        ))}
      </div>
      <span className="text-xs text-muted">
        {authors.length > 2
          ? `${authors[0].name} +${authors.length - 1}`
          : authors.map((a) => a.name).join(", ")}
      </span>
    </div>
  );
}
