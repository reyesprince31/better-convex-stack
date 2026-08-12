import { ArrowRight, Check, CircleDot, Layers3, Sparkles, TimerReset } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

const highlights = [
  "A calm home for every project",
  "Clear ownership across every team",
  "Context that stays close to the work",
] as const;

const metrics = [
  { label: "Projects in motion", value: "24" },
  { label: "Focus time reclaimed", value: "18h" },
  { label: "Weekly momentum", value: "+32%" },
] as const;

export default function MarketingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_30%),linear-gradient(to_bottom,transparent, color-mix(in_oklch,var(--muted)_35%,transparent))]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-28">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 border border-border bg-background/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              <CircleDot className="size-3 text-emerald-500" />
              The focused team workspace
            </div>
            <h1 className="max-w-3xl text-6xl font-medium leading-[0.92] tracking-[-0.07em] sm:text-7xl lg:text-[7.6rem]">
              Make room
              <br />
              for <span className="text-muted-foreground">good work.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Orbit brings projects, decisions, and the people behind them into one clear, flexible
              workspace.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={"/signup" as Route}
                className="group inline-flex h-10 items-center gap-3 bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-80"
              >
                Start building free
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex h-10 items-center px-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore the journal
              </Link>
            </div>
          </div>
          <div className="relative lg:pb-2">
            <div className="absolute -inset-5 bg-primary/5 blur-3xl" />
            <div className="relative border border-border/80 bg-background/90 p-3 shadow-2xl shadow-primary/5">
              <div className="border border-border/70 bg-muted/20 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                      Monday / overview
                    </p>
                    <p className="mt-1 text-sm font-medium">A clear week ahead</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    On track
                  </span>
                </div>
                <div className="grid gap-2 py-4">
                  {[
                    ["Launch brief", "Today", "72%"],
                    ["Research sprint", "Tomorrow", "48%"],
                    ["Partner review", "Thu", "18%"],
                  ].map(([name, due, progress]) => (
                    <div
                      key={name}
                      className="grid grid-cols-[1fr_auto] gap-3 border border-border/60 bg-background p-3"
                    >
                      <div>
                        <p className="text-xs font-medium">{name}</p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{due}</p>
                      </div>
                      <div className="flex items-center gap-2 self-center">
                        <div className="h-1 w-14 bg-muted">
                          <div className="h-1 bg-foreground" style={{ width: progress }} />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {progress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="font-mono text-xl tracking-[-0.06em]">{metric.value}</p>
                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="principles"
        className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-28"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Designed for momentum
          </p>
          <h2 className="mt-5 max-w-md text-4xl font-medium leading-tight tracking-[-0.06em] sm:text-5xl">
            Less ceremony. More clarity.
          </h2>
        </div>
        <div className="grid gap-0 border-y border-border/70">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-center gap-5 border-b border-border/70 py-6 last:border-b-0"
            >
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              <span className="text-sm sm:text-base">{highlight}</span>
              <Check className="ml-auto size-4 text-emerald-500" />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/25">
        <div className="mx-auto grid w-full max-w-7xl gap-px bg-border/70 px-5 sm:px-8 md:grid-cols-3">
          {[
            {
              icon: Layers3,
              title: "One steady surface",
              body: "Projects, docs, and decisions live together so context never gets lost.",
            },
            {
              icon: TimerReset,
              title: "Built for deep work",
              body: "Lightweight rituals keep the team aligned without filling the calendar.",
            },
            {
              icon: Sparkles,
              title: "A little more human",
              body: "Make progress visible, celebrate the small wins, and keep moving.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background px-6 py-10 sm:px-8">
              <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="mt-6 text-sm font-medium">{title}</h3>
              <p className="mt-3 max-w-xs text-xs leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-mono tracking-[0.14em] uppercase">Orbit / 2026</span>
        <span>A mock marketing surface for the Better Convex Stack.</span>
      </footer>
    </main>
  );
}
