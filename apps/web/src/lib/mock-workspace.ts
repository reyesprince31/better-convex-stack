export type MockProject = {
  id: string;
  name: string;
  team: string;
  progress: number;
  color: string;
  status: "On track" | "Needs attention";
  due: string;
};

export type MockMember = {
  name: string;
  initials: string;
  role: string;
};

export type MockOrganization = {
  slug: string;
  name: string;
  plan: string;
  memberCount: number;
  activeProjects: number;
  momentum: string;
  projects: MockProject[];
  members: MockMember[];
};

export const mockPersonalWorkspace = {
  dateLabel: "Tuesday, May 19, 2026",
  greeting: "Good morning, friend.",
  description: "Here is the shape of your week. Keep the important things moving.",
  stats: [
    { label: "In motion", value: "08", note: "2 due this week", tone: "text-violet-500" },
    {
      label: "Focus blocks",
      value: "14h",
      note: "3h more than last week",
      tone: "text-emerald-500",
    },
    { label: "Wrapped up", value: "23", note: "A very good Tuesday", tone: "text-amber-500" },
  ],
  projects: [
    {
      id: "launch-brief",
      name: "Launch brief",
      team: "Acme Labs",
      progress: 72,
      color: "bg-violet-500",
      status: "On track",
      due: "Today",
    },
    {
      id: "research-sprint",
      name: "Research sprint",
      team: "Personal",
      progress: 48,
      color: "bg-emerald-500",
      status: "On track",
      due: "Tomorrow",
    },
    {
      id: "partner-review",
      name: "Partner review",
      team: "Acme Labs",
      progress: 18,
      color: "bg-amber-500",
      status: "Needs attention",
      due: "Thursday",
    },
  ] satisfies MockProject[],
  ritual: {
    title: "What would make today feel complete?",
    description: "Write it down, give it a home, and let the rest wait its turn.",
  },
};

export const mockOrganizations: MockOrganization[] = [
  {
    slug: "acme-labs",
    name: "Acme Labs",
    plan: "Pro",
    memberCount: 18,
    activeProjects: 12,
    momentum: "86%",
    projects: [
      {
        id: "spring-launch",
        name: "Spring launch",
        team: "Product circle",
        progress: 82,
        color: "bg-violet-500",
        status: "On track",
        due: "Friday",
      },
      {
        id: "customer-interviews",
        name: "Customer interviews",
        team: "Research circle",
        progress: 64,
        color: "bg-emerald-500",
        status: "On track",
        due: "Thursday",
      },
      {
        id: "onboarding-flow",
        name: "New onboarding flow",
        team: "Growth circle",
        progress: 38,
        color: "bg-amber-500",
        status: "Needs attention",
        due: "Next week",
      },
    ],
    members: [
      { name: "Maya Chen", initials: "MC", role: "Product" },
      { name: "Jon Bell", initials: "JB", role: "Engineering" },
      { name: "Rina Patel", initials: "RP", role: "Research" },
      { name: "Alex Kim", initials: "AK", role: "Design" },
    ],
  },
  {
    slug: "northstar",
    name: "Northstar",
    plan: "Free",
    memberCount: 7,
    activeProjects: 4,
    momentum: "71%",
    projects: [
      {
        id: "northstar-roadmap",
        name: "Northstar roadmap",
        team: "Core circle",
        progress: 58,
        color: "bg-violet-500",
        status: "On track",
        due: "Friday",
      },
      {
        id: "field-notes",
        name: "Field notes",
        team: "Research circle",
        progress: 34,
        color: "bg-emerald-500",
        status: "On track",
        due: "Next week",
      },
    ],
    members: [
      { name: "Sam Rivera", initials: "SR", role: "Founder" },
      { name: "Nora Ellis", initials: "NE", role: "Operations" },
      { name: "Theo Grant", initials: "TG", role: "Product" },
    ],
  },
];

export const mockOrganizationInvoices = [
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "$29.00", status: "Paid" },
] as const;

// Keep this function as the route data boundary. Convex-backed loaders can
// replace it later without changing the workspace page and navigation shapes.
export function getMockOrganization(slug: string): MockOrganization {
  return (
    mockOrganizations.find((organization) => organization.slug === slug) ?? mockOrganizations[0]
  );
}

export const mockAdminStats = {
  activeMembers: 48,
  organizations: mockOrganizations.length,
  systemHealth: "99.9%",
};

export const mockAdminResources = {
  users: [
    { name: "Maya Chen", detail: "maya@acme.test", status: "Active" },
    { name: "Jon Bell", detail: "jon@northstar.test", status: "Active" },
    { name: "Rina Patel", detail: "rina@orbit.test", status: "Invited" },
  ],
  organizations: mockOrganizations.map((organization) => ({
    name: organization.name,
    detail: `${organization.memberCount} members / ${organization.plan}`,
    status: "Healthy",
  })),
  subscriptions: [
    { name: "Pro", detail: "32 active subscriptions", status: "Growing" },
    { name: "Enterprise", detail: "6 active subscriptions", status: "Stable" },
    { name: "Free", detail: "10 workspaces", status: "Healthy" },
  ],
};
