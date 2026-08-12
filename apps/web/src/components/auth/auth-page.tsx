import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Image
          src="/auth-orbit.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,8,15,0.8),rgba(5,8,15,0.18)_65%,rgba(5,8,15,0.7))]" />
        <div>
          <Link
            href="/"
            className="relative font-mono text-xs tracking-[0.22em] uppercase opacity-70"
          >
            Orbit / account
          </Link>
          <div className="relative mt-24 max-w-lg">
            <p className="font-mono text-[10px] tracking-[0.2em] text-background/55 uppercase">
              A quieter way to build
            </p>
            <h1 className="mt-5 text-5xl leading-[0.98] font-medium tracking-[-0.06em] xl:text-7xl">
              Keep the signal.
              <br />
              Lose the noise.
            </h1>
          </div>
        </div>
        <p className="relative max-w-sm text-sm leading-6 text-background/60">
          Orbit gives every team a clear place to think, plan, and ship together - without turning
          work into a second job.
        </p>
      </section>
      <section className="flex items-center justify-center bg-background px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-mono text-xs font-semibold tracking-[0.22em] uppercase">
              Orbit
            </Link>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
