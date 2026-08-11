import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on building focused teams and faster-feeling products.",
};

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">The Orbit journal</p>
        <h1 className="mt-5 text-6xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-8xl">Notes for the way forward.</h1>
        <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground">Small ideas about product, engineering, and the rituals that help good teams do their best work.</p>
      </div>
      <div className="mt-20 grid gap-0 border-y border-border/70">
        {posts.map((post, index) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group grid gap-6 border-b border-border/70 py-8 last:border-b-0 sm:grid-cols-[80px_1fr_auto] sm:items-start sm:py-10">
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{post.eyebrow}</p>
              <h2 className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-muted-foreground sm:text-3xl">{post.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              <p className="mt-6 font-mono text-[10px] text-muted-foreground">{post.date} <span className="mx-2">/</span> {post.readTime}</p>
            </div>
            <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </main>
  );
}
