import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { T } from "@/components/T";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
        404
      </p>
      <h1 className="mb-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        <T k="notFound.title" />
      </h1>
      <p className="mb-8 text-sm text-muted leading-relaxed max-w-md mx-auto">
        <T k="notFound.description" />
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md border border-border/50 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-accent"
      >
        <ArrowLeft size={14} />
        <T k="notFound.back" />
      </Link>
    </div>
  );
}
