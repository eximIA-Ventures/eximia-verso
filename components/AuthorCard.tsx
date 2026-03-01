import Image from "next/image";
import type { Author } from "@/lib/types";

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

/** Inline author display for article header */
export function AuthorCard({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  if (authors.length === 1) {
    const author = authors[0];
    return (
      <div className="flex items-center gap-3">
        <AuthorAvatar author={author} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">{author.name}</p>
          {author.bio && (
            <p className="truncate text-xs text-muted">{author.bio}</p>
          )}
        </div>
      </div>
    );
  }

  // Multi-author: stacked avatars + names
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {authors.map((author) => (
          <div
            key={author.id}
            className="ring-2 ring-bg rounded-full"
          >
            <AuthorAvatar author={author} size={36} />
          </div>
        ))}
      </div>
      <p className="text-sm text-primary">
        {authors.map((a) => a.name).join(", ")}
      </p>
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
