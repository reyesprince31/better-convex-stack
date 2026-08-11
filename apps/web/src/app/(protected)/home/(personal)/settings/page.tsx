export default function PersonalSettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="border-b border-border/70 pb-8"><p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Personal workspace</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Settings</h1><p className="mt-3 text-sm text-muted-foreground">A quiet place for the details that make Orbit yours.</p></div>
      <div className="divide-y divide-border/70 border-y border-border/70 bg-background">
        {["Profile and identity", "Notifications", "Appearance"].map((setting) => <div key={setting} className="flex items-center justify-between px-5 py-5"><div><p className="text-sm font-medium">{setting}</p><p className="mt-1 text-xs text-muted-foreground">Mock settings surface for the next route.</p></div><span className="font-mono text-[10px] text-muted-foreground">Soon</span></div>)}
      </div>
    </div>
  );
}
