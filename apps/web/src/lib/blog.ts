export const posts = [
  {
    slug: "instant-navigation-with-next-16",
    eyebrow: "Product / Engineering",
    title: "Instant navigation is a design decision",
    excerpt: "The fastest-feeling apps make the next screen feel inevitable before the data arrives.",
    date: "May 14, 2026",
    readTime: "6 min read",
    intro: "A route transition is a promise: the product understood where you wanted to go. Next.js 16 makes it easier to keep that promise by separating the stable shell from the data that can arrive a moment later.",
    sections: [
      ["Start with the shell", "A loading boundary is not an afterthought. It is the first frame of the next route, so make it match the layout users are about to see: the same spacing, same typography, and the same shape of content."],
      ["Cache the right things", "Static navigation, labels, and summaries are excellent candidates for use cache. User-specific data belongs outside the cache boundary and behind a small Suspense island."],
      ["Keep the handoff quiet", "Prefetch links that are likely to be used, avoid waterfalls in the server tree, and reserve opt-outs for the rare page where waiting is genuinely the product behavior."],
    ],
  },
  {
    slug: "the-weekly-orbit",
    eyebrow: "Rituals / Teams",
    title: "The weekly orbit: a lighter planning ritual",
    excerpt: "A small, repeatable loop for turning a busy week into a shared sense of direction.",
    date: "April 28, 2026",
    readTime: "4 min read",
    intro: "Planning works when it creates a little more confidence than it creates overhead. The weekly orbit is a short loop: name the important work, make ownership visible, and leave enough room for reality to happen.",
    sections: [
      ["Name the outcome", "Start with what should be different by Friday. A useful outcome gives every task a home and makes it easier to say no to work that is merely loud."],
      ["Make ownership obvious", "Every meaningful project needs one person who can answer what is next. Ownership is not isolation; it is a clear invitation for collaborators to help."],
      ["Leave a little white space", "The best plan has room for the unexpected. A team that can absorb new information without rewriting the whole week is a team with momentum."],
    ],
  },
] as const;

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
