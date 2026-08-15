"use client";

import * as React from "react";
import { cn } from "@better-convex-stack/ui/lib/utils";

type AvatarSize = "xs" | "sm" | "default" | "lg";
type AvatarShape = "circle" | "square";
type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarProps extends React.ComponentProps<"span"> {
  size?: AvatarSize;
  shape?: AvatarShape;
}

const AvatarContext = React.createContext<{
  status: ImageLoadingStatus;
  setStatus: (status: ImageLoadingStatus) => void;
}>({
  status: "idle",
  setStatus: () => {},
});

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[10px]",
  default: "size-9 text-xs",
  lg: "size-11 text-sm",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-none",
};

function Avatar({ className, size = "default", shape = "square", ...props }: AvatarProps) {
  const [status, setStatus] = React.useState<ImageLoadingStatus>("idle");

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        data-slot="avatar"
        data-size={size}
        data-shape={shape}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-muted font-mono font-medium text-foreground select-none ring-1 ring-border/80",
          sizeClasses[size],
          shapeClasses[shape],
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

function AvatarImage({
  className,
  src,
  alt = "",
  onLoad,
  onError,
  ...props
}: React.ComponentProps<"img">) {
  const { setStatus } = React.useContext(AvatarContext);

  React.useEffect(() => {
    if (!src) {
      setStatus("error");
    } else {
      setStatus("loading");
    }
  }, [src, setStatus]);

  if (!src) {
    return null;
  }

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onLoad={(e) => {
        setStatus("loaded");
        onLoad?.(e);
      }}
      onError={(e) => {
        setStatus("error");
        onError?.(e);
      }}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }: React.ComponentProps<"span">) {
  const { status } = React.useContext(AvatarContext);

  // When image is successfully loaded, hide fallback completely so transparent images don't show text underneath
  if (status === "loaded") {
    return null;
  }

  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center uppercase tracking-tight font-mono",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function AvatarGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn("flex items-center -space-x-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
