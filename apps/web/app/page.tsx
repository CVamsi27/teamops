import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function HomePage() {
  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Run Teams. Ship Projects. Track Tasks.
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          TeamOps is a compact, full-stack project management app with teams,
          projects, tasks, roles, and real-time updates.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            className="px-5 py-2 rounded-lg bg-primary text-white"
            href="/dashboard"
          >
            Open Dashboard
          </Link>
          <Link className="px-5 py-2 rounded-lg border" href="/pricing">
            See Pricing
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Team Management",
            desc: "Create teams, invite members, and assign roles (Admin/Member/Viewer).",
          },
          {
            title: "Projects & Tasks",
            desc: "Link projects to teams; create tasks with priorities and deadlines.",
          },
          {
            title: "Real-time & Events",
            desc: "WebSockets for live updates; Kafka for event streams (planned).",
          },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {f.desc}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            tier: "Starter",
            price: "$0",
            features: ["Up to 2 teams", "Basic tasks", "Email invites"],
          },
          {
            tier: "Pro",
            price: "$9",
            features: ["Unlimited teams", "Projects", "Priority & deadlines"],
          },
          {
            tier: "Business",
            price: "$29",
            features: ["RBAC", "WebSockets", "Audit events (Kafka)"],
          },
        ].map((p) => (
          <Card key={p.tier}>
            <CardHeader>
              <CardTitle>
                {p.tier} — {p.price}/mo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc ml-5 space-y-1">
                {p.features.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="contact" className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Want a demo or enterprise features? Email{" "}
            <a className="underline" href="mailto:hello@teamops.app">
              hello@teamops.app
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
