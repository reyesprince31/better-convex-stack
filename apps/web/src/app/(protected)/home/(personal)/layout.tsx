import { PersonalHeader } from "@/components/personal-header";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <PersonalHeader />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
