"use client";

import { Link2, Linkedin, Twitter } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const articlePath = `/articles/${slug}`;
  const url = baseUrl ? `${baseUrl}${articlePath}` : articlePath;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        Propagar
      </span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
        aria-label="Compartilhar no LinkedIn"
      >
        <Linkedin size={15} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
        aria-label="Compartilhar no X"
      >
        <Twitter size={15} />
      </a>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-primary"
        aria-label="Copiar link"
      >
        <Link2 size={15} />
      </button>
      {copied && (
        <span className="text-xs text-accent animate-in fade-in">Link copiado</span>
      )}
    </div>
  );
}
