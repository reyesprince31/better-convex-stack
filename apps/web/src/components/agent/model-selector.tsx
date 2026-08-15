"use client";

import { Check, ChevronDown, Cpu, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ModelItem } from "./agent-types";

type ModelSelectorProps = {
  activeModel: string;
  availableModels: ModelItem[];
  provider?: "google" | "openai";
  placement?: "top" | "bottom";
  size?: "sm" | "default";
  onModelChange: (newModel: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ModelSelector({
  activeModel,
  availableModels,
  provider = "google",
  placement = "top",
  size = "sm",
  onModelChange,
  disabled = false,
  className = "",
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeModelData = availableModels.find((m) => m.id === activeModel);
  const activeDisplayName = activeModelData?.displayName || activeModel || "Select model";

  const filteredModels = availableModels.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getModelBadge = (id: string) => {
    if (id.includes("thinking") || id.includes("o1") || id.includes("o3")) {
      return { label: "Reasoning", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" };
    }
    if (id.includes("flash") || id.includes("mini")) {
      return { label: "Fast", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
    }
    if (id.includes("pro") || id.includes("4o")) {
      return { label: "Flagship", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
    }
    return null;
  };

  const isFullWidth = size === "default";

  return (
    <div ref={dropdownRef} className={`relative ${isFullWidth ? "w-full" : "inline-block"} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg border border-border/80 bg-background/80 font-mono text-foreground shadow-2xs transition-colors hover:bg-muted/40 disabled:opacity-50 cursor-pointer ${
          size === "default"
            ? "h-9 w-full justify-between px-3 text-xs"
            : "h-7 gap-1.5 px-2.5 text-[11px]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {provider === "openai" ? (
            <Cpu className="size-3 text-muted-foreground shrink-0" />
          ) : (
            <Sparkles className="size-3 text-primary shrink-0" />
          )}
          <span className="truncate font-medium">{activeDisplayName}</span>
        </div>
        <ChevronDown
          className={`size-3 text-muted-foreground shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Searchable Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-72 rounded-xl border border-border/90 bg-popover p-1 text-popover-foreground shadow-lg shadow-black/10 outline-none animate-in fade-in zoom-in-95 ${
            placement === "bottom" ? "top-full mt-1.5 origin-top-left" : "bottom-full mb-1.5 origin-bottom-left"
          } ${isFullWidth ? "w-full" : "w-72"}`}
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-1.5">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Model Items List */}
          <div className="max-h-56 overflow-y-auto py-1 overscroll-contain">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No models found.
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === activeModel;
                const badge = getModelBadge(model.id);

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] truncate">{model.displayName}</span>
                        {badge && (
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono text-[9px] ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <span className="line-clamp-1 text-[10px] text-muted-foreground">
                          {model.description}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
