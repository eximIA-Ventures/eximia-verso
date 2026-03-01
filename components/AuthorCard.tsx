"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Linkedin, Twitter, Globe, Mail, X } from "lucide-react";
import type { Author } from "@/lib/types";

const SOCIAL_ICONS: Record<string, typeof Globe> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  website: Globe,
  email: Mail,
};

function AuthorAvatar({
  author,
  size = 40,
}: {
  author: Author;
  size?: number;
}) {
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

/* ─── Fullscreen author modal ─── */

function AuthorModal({
  author,
  onClose,
}: {
  author: Author;
  onClose: () => void;
}) {
  const socialEntries = Object.entries(author.socialLinks).filter(
    ([, url]) => url
  );

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const bioLines = author.bio
    ? author.bio.split("\n").filter((l) => l.trim())
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-bg shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted transition-colors hover:bg-elevated hover:text-primary"
        >
          <X size={18} />
        </button>

        {/* Accent stripe */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-accent via-accent/70 to-accent/40" />

        <div className="px-8 py-10 sm:px-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <AuthorAvatar author={author} size={96} />

            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              {author.name}
            </h2>

            {author.role && author.role !== "author" && (
              <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {author.role}
              </p>
            )}

            {/* Social links */}
            {socialEntries.length > 0 && (
              <div className="mt-4 flex items-center gap-1">
                {socialEntries.map(([platform, url]) => {
                  const Icon =
                    SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
                  const href =
                    platform.toLowerCase() === "email"
                      ? `mailto:${url}`
                      : url;
                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-accent"
                      title={platform}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          {/* Bio / text */}
          {bioLines.length > 0 && (
            <div className="prose prose-sm mx-auto max-w-lg text-muted">
              {bioLines.map((line, i) => (
                <p key={i} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Inline author display (article header) ─── */

export function AuthorCard({ authors }: { authors: Author[] }) {
  const [openAuthor, setOpenAuthor] = useState<Author | null>(null);

  if (authors.length === 0) return null;

  if (authors.length === 1) {
    const author = authors[0];
    return (
      <>
        <button
          onClick={() => setOpenAuthor(author)}
          className="flex items-center gap-3 rounded-lg px-1 py-0.5 -mx-1 transition-colors hover:bg-elevated/50 cursor-pointer text-left"
        >
          <AuthorAvatar author={author} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary underline decoration-border/50 underline-offset-2 transition-colors group-hover:decoration-accent">
              {author.name}
            </p>
            {author.bio && (
              <p className="truncate text-xs text-muted max-w-md">
                {author.bio.split("\n")[0]}
              </p>
            )}
          </div>
        </button>
        {openAuthor && (
          <AuthorModal
            author={openAuthor}
            onClose={() => setOpenAuthor(null)}
          />
        )}
      </>
    );
  }

  // Multi-author
  return (
    <>
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
                onClick={() => setOpenAuthor(author)}
                className="font-medium underline decoration-border underline-offset-2 transition-colors hover:text-accent hover:decoration-accent cursor-pointer"
              >
                {author.name}
              </button>
              {i < authors.length - 1 && (
                <span className="text-muted">,</span>
              )}
            </span>
          ))}
        </div>
      </div>
      {openAuthor && (
        <AuthorModal
          author={openAuthor}
          onClose={() => setOpenAuthor(null)}
        />
      )}
    </>
  );
}

/* ─── Small avatar for article cards in listings ─── */

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
