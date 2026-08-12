"use client";

import * as React from "react";
import { cn } from "@better-convex-stack/ui/lib/utils";

type AvatarSize = "xs" | "sm" | "default" | "lg";
type AvatarShape = "circle" | "square";

interface AvatarProps extends React.ComponentProps<"span"> {
  size?: AvatarSize;
  shape?: AvatarShape;
}

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

function Avatar({
  className,
  size = "default",
  shape = "circle",
  ...props
}: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-muted font-mono font-medium text-foreground select-none ring-1 ring-background",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  alt = "",
  onError,
  ...props
}: React.ComponentProps<"img">) {
  const [hasError, setHasError] = React.useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center uppercase tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function AvatarGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
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
