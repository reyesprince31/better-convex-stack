import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { getPost, posts } from "@/lib/blog";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export const metadata: Metadata = { title: "Journal" };

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to journal
      </Link>
      <article className="mx-auto mt-20 max-w-3xl">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{post.eyebrow}</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.07em] sm:text-7xl">{post.title}</h1>
        <div className="mt-8 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>{post.date}</span><span>/</span><span>{post.readTime}</span>
        </div>
        <p className="mt-14 border-l-2 border-foreground pl-5 text-lg leading-8 text-foreground/80 sm:text-xl">{post.intro}</p>
        <div className="mt-14 grid gap-10">
          {post.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-xl font-medium tracking-[-0.03em]">{heading}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
