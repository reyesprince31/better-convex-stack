"use client";

import {
  Activity,
  ArrowLeft,
  BookOpen,
  Building2,
  CircleUserRound,
  FolderKanban,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import UserMenu from "@/components/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@better-convex-stack/ui/components/sidebar";

type SidebarKind = "admin" | "organization";

const organizationLinks = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Projects", icon: FolderKanban },
  { label: "People", icon: Users },
] as const;

const adminLinks = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Members", icon: Users },
  { label: "Organizations", icon: Building2 },
  { label: "Activity", icon: Activity },
] as const;

export function AppSidebar({ kind }: { kind: SidebarKind }) {
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params?.orgSlug ?? "acme-labs";
  const orgName = orgSlug === "northstar" ? "Northstar" : "Acme Labs";
  const isAdmin = kind === "admin";
  const links = isAdmin ? adminLinks : organizationLinks;
  const homeHref = isAdmin ? "/admin" : `/home/${orgSlug}`;
  const sectionLabel = isAdmin ? "Admin console" : orgName;

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={homeHref as `/admin` | `/home/${string}`} />}>
              <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                {isAdmin ? <ShieldCheck className="size-4" /> : <Building2 className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{sectionLabel}</span>
                <span className="truncate text-xs text-muted-foreground">Orbit workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Control room" : "Workspace"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    render={<Link href={homeHref as `/admin` | `/home/${string}`} />}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Quick links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/home" />} tooltip="Personal workspace">
                  <CircleUserRound />
                  <span>Personal workspace</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/blog" />} tooltip="Journal">
                  <BookOpen />
                  <span>Journal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/home/settings" />} tooltip="Settings">
                    <Settings2 />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <UserMenu />
        </div>
        <Link href="/home" className="flex items-center gap-2 px-2 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground">
          <ArrowLeft className="size-3.5" />
          Back to personal
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
