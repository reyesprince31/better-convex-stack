"use client";

import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@better-convex-stack/ui/components/avatar";
import { Button } from "@better-convex-stack/ui/components/button";
import { useMutation } from "convex/react";
import { Camera, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type AvatarUploadProps = {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  initials: string;
};

export function AvatarUpload({ user, initials }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile(api.files);
  const updateUserAvatar = useMutation(api.files.updateUserAvatar);
  const removeUserAvatar = useMutation(api.files.removeUserAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    try {
      setIsUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 1. Upload to Cloudflare R2
      const key = await uploadFile(file);

      // 2. Update Convex user profile (deletes previous R2 avatar if present)
      const result = await updateUserAvatar({ key });
      if (result.success) {
        // 3. Update Better-Auth local cache
        await authClient.updateUser({
          image: result.url,
        });
        toast.success("Profile photo updated successfully!");
      }
    } catch (error) {
      setPreviewUrl(null);
      const message = error instanceof Error ? error.message : "Failed to upload photo.";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemovePhoto() {
    try {
      setIsUploading(true);
      setPreviewUrl(null);

      // Delete from R2 & DB via Convex
      await removeUserAvatar({});

      // Update Better-Auth local cache
      await authClient.updateUser({
        image: "",
      });

      toast.success("Profile photo removed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove photo.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  const currentImageSrc = previewUrl ?? user.image ?? undefined;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="relative size-16 sm:size-18 shrink-0 rounded-none overflow-hidden border border-border bg-muted cursor-pointer transition-all hover:border-foreground group/avatar ring-1 ring-border/50"
          role="button"
          tabIndex={0}
          title="Click to change photo"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <Avatar className="size-full rounded-none ring-0">
            <AvatarImage src={currentImageSrc} alt={user.name} />
            <AvatarFallback className="rounded-none text-lg font-mono text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Hover Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100">
            <Camera className="size-4" />
            <span className="text-[9px] font-mono tracking-wider uppercase mt-0.5">Edit</span>
          </div>

          {/* Upload Spinner */}
          {isUploading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-xs">
              <LoaderCircle className="size-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Profile Picture</h3>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            Upload a high-res image. Max size 5MB (JPG, PNG, WebP).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {currentImageSrc ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-muted-foreground hover:text-destructive rounded-none"
            disabled={isUploading}
            onClick={handleRemovePhoto}
          >
            Remove
          </Button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium gap-1.5 rounded-none px-3 border-foreground/20 hover:border-foreground"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : currentImageSrc ? (
            <Camera className="size-3.5" />
          ) : (
            <Upload className="size-3.5" />
          )}
          <span>{currentImageSrc ? "Change" : "Upload"}</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}
