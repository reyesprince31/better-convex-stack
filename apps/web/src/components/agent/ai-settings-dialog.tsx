"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@better-convex-stack/ui/components/dialog";
import { api } from "@better-convex-stack/backend/convex/_generated/api";

type AiSettingsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiSettingsDialog({ isOpen, onOpenChange }: AiSettingsDialogProps) {
  const aiSettings = useQuery(api.chat.getAiSettings);
  const validateAndSaveKeyAction = useAction(api.chat.validateAndSaveApiKey);
  const updateProviderMutation = useMutation(api.chat.updateActiveProvider);
  const updateModelMutation = useMutation(api.chat.updateActiveModel);

  const [activeTab, setActiveTab] = useState<"google" | "openai">("google");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [modelOverride, setModelOverride] = useState<string | null>(null);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");

  const isGoogle = activeTab === "google";
  const currentProviderInfo = isGoogle ? aiSettings?.google : aiSettings?.openai;
  const isCurrentConfigured = Boolean(currentProviderInfo?.isConfigured);
  const currentActiveModel = modelOverride || currentProviderInfo?.model || "";
  const currentAvailableModels = currentProviderInfo?.availableModels || [];

  // Synchronize active model
  useEffect(() => {
    if (currentProviderInfo?.model) {
      setModelOverride(currentProviderInfo.model);
    }
  }, [currentProviderInfo?.model, activeTab]);

  const handleSaveKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    try {
      const result = await validateAndSaveKeyAction({
        provider: activeTab,
        apiKey: apiKey.trim(),
      });

      if (result.success) {
        toast.success(
          `${isGoogle ? "Google Gemini" : "OpenAI"} key verified! Loaded ${result.models.length} models.`,
        );
        setApiKey("");
      } else {
        toast.error(result.error || "Failed to validate API key");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validation request failed";
      toast.error(msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSelectActiveProvider = async (provider: "google" | "openai") => {
    try {
      await updateProviderMutation({ provider });
      toast.success(`Active provider set to ${provider === "google" ? "Google Gemini" : "OpenAI"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to switch provider");
    }
  };

  const handleModelChange = async (model: string) => {
    setModelOverride(model);
    try {
      await updateModelMutation({ model, provider: activeTab });
      toast.success(`Default model set to ${model}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change model");
      if (currentProviderInfo?.model) setModelOverride(currentProviderInfo.model);
    }
  };

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

  const filteredModels = currentAvailableModels.filter(
    (m) =>
      m.displayName.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-y-auto">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            <span>AI &amp; Provider Settings (BYOK)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Connect your API keys for Google Gemini and OpenAI. Keys are encrypted and used dynamically.
          </DialogDescription>
        </DialogHeader>

        {/* Provider Segmented Switcher */}
        <div className="px-5 sm:px-6">
          <div className="flex rounded-lg bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("google");
                setApiKey("");
                setIsModelPickerOpen(false);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "google"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Google Gemini</span>
              {aiSettings?.google?.isConfigured && (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("openai");
                setApiKey("");
                setIsModelPickerOpen(false);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "openai"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="size-3.5 text-muted-foreground" />
              <span>OpenAI</span>
              {aiSettings?.openai?.isConfigured && (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 px-5 py-4 sm:px-6">
          {/* Status & Active Selector Banner */}
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">
                {isGoogle ? "Google Gemini" : "OpenAI"} Status
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isCurrentConfigured
                  ? `Configured (${currentProviderInfo?.maskedKey})`
                  : "No API key configured"}
              </span>
            </div>

            {isCurrentConfigured && (
              <Button
                type="button"
                variant={aiSettings?.provider === activeTab ? "default" : "outline"}
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => handleSelectActiveProvider(activeTab)}
              >
                {aiSettings?.provider === activeTab ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-500" /> Active
                  </span>
                ) : (
                  "Set as Active"
                )}
              </Button>
            )}
          </div>

          {/* API Key Input with Inline Save Button */}
          <form onSubmit={handleSaveKey} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-foreground">
              <label htmlFor="ai-key-input">
                {isGoogle ? "Gemini API Key" : "OpenAI API Key"}
              </label>
              <a
                href={
                  isGoogle
                    ? "https://aistudio.google.com/app/apikey"
                    : "https://platform.openai.com/api-keys"
                }
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                Get API Key &rarr;
              </a>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex flex-1 items-center">
                <Key className="absolute left-3 size-3.5 text-muted-foreground" />
                <input
                  id="ai-key-input"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                  placeholder={
                    isCurrentConfigured
                      ? `Update key (currently ${currentProviderInfo?.maskedKey})`
                      : isGoogle
                        ? "AIzaSy..."
                        : "sk-..."
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 font-mono text-xs outline-none focus:border-primary placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isValidating || !apiKey.trim()}
                size="sm"
                className="h-9 px-3.5 text-xs shrink-0 cursor-pointer"
              >
                {isValidating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span>Save</span>
                )}
              </Button>
            </div>
          </form>

          {/* In-Place Searchable Model Selector (No Overflow Clipping) */}
          {isCurrentConfigured && currentAvailableModels.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Default Model
              </label>

              <div className="rounded-lg border border-border/80 bg-background/50 overflow-hidden">
                {/* Trigger Row */}
                <button
                  type="button"
                  onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
                  className="flex h-9 w-full items-center justify-between px-3 text-xs font-mono transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isGoogle ? (
                      <Sparkles className="size-3.5 text-primary shrink-0" />
                    ) : (
                      <Cpu className="size-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium text-foreground truncate">
                      {currentAvailableModels.find((m) => m.id === currentActiveModel)?.displayName ||
                        currentActiveModel}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-3.5 text-muted-foreground transition-transform duration-150 ${
                      isModelPickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* In-Place Searchable List */}
                {isModelPickerOpen && (
                  <div className="border-t border-border/60 bg-muted/10 p-2 space-y-2">
                    <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background px-2.5 py-1">
                      <Search className="size-3 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 overscroll-contain">
                      {filteredModels.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          No models found.
                        </div>
                      ) : (
                        filteredModels.map((m) => {
                          const isSelected = m.id === currentActiveModel;
                          const badge = getModelBadge(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                handleModelChange(m.id);
                                setIsModelPickerOpen(false);
                                setModelSearchQuery("");
                              }}
                              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "hover:bg-muted/60 text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-[11px] truncate">
                                  {m.displayName}
                                </span>
                                {badge && (
                                  <span
                                    className={`rounded px-1.5 py-0.2 font-mono text-[9px] ${badge.color}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clean Footer */}
        <DialogFooter className="border-t border-border/50 bg-muted/10 px-5 py-3 sm:px-6 sm:py-3">
          <DialogClose render={<Button variant="outline" size="sm" className="text-xs w-full sm:w-auto">Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
