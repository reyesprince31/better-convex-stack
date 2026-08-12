import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@better-convex-stack/ui/components/card";
import type { ReactNode } from "react";

export default function AuthFormShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Card className="gap-0 border-border/70 py-0 shadow-none">
      <CardHeader className="gap-2 border-b border-border/70 px-5 py-6 sm:px-6">
        <CardTitle className="text-2xl font-medium tracking-[-0.05em]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 py-6 sm:px-6">{children}</CardContent>
      <CardFooter className="justify-center border-t border-border/70 px-5 py-5 sm:px-6">
        {footer}
      </CardFooter>
    </Card>
  );
}
