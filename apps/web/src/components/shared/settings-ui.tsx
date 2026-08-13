"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type * as React from "react";

import { cn } from "@better-convex-stack/ui/lib/utils";

export type SettingsTab<T extends string = string> = {
  id: T;
  label: string;
  href: Route;
  icon: LucideIcon;
};

export function SettingsTabs<T extends string>({
  tabs,
  activeTab,
  label,
}: {
  tabs: ReadonlyArray<SettingsTab<T>>;
  activeTab: T;
  label: string;
}) {
  return (
    <nav className="overflow-x-auto" aria-label={label}>
      <div className="flex min-w-max gap-1 border border-border/80 bg-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-2 px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SettingsPanel({
  title,
  description,
  action,
  children,
  footer,
  tone = "default",
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden border bg-card",
        tone === "danger" ? "border-destructive/35" : "border-border/80",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6",
          tone === "danger" ? "border-destructive/25" : "border-border/70",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs/relaxed text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      {footer ? (
        <div
          className={cn(
            "flex flex-col-reverse gap-3 border-t bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6",
            tone === "danger" ? "border-destructive/25" : "border-border/70",
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function SettingsToggle({
  id,
  checked,
  disabled = false,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center justify-center ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`size-4 rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}
