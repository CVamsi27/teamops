import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function HomePage() {
  return (
    <section className="flex flex-col section-spacing">
      <div className="text-center flex flex-col content-spacing">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Run Teams. Ship Projects. Track Tasks.
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          TeamOps is a compact, full-stack project management app with teams,
          projects, tasks, roles, and real-time updates.
        </p>
        <div className="flex justify-center content-spacing">
          <Link
            className="padding-button rounded-lg bg-primary text-secondary"
            href="/dashboard"
          >
            Open Dashboard
          </Link>
          <Link className="padding-button rounded-lg border" href="/pricing">
            View Pricing
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 grid-gap">
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

      <div className="grid md:grid-cols-3 grid-gap">
        {[
          {
            tier: "Pricing",
            price: "Coming Soon",
            features: [
              "Flexible plans for all team sizes",
              "Early access available",
              "Enterprise options",
            ],
          },
          {
            tier: "Features",
            price: "Full-Stack",
            features: [
              "Team management & RBAC",
              "Projects & task tracking",
              "Real-time updates",
            ],
          },
          {
            tier: "Contact",
            price: "Get Started",
            features: [
              "Demo available",
              "Enterprise inquiries",
              "Custom solutions",
            ],
          },
        ].map((p) => (
          <Card key={p.tier}>
            <CardHeader>
              <CardTitle>
                {p.tier} — {p.price}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc ml-5 flex flex-col grid-gap-sm">
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
            <a className="underline" href="mailto:cvamsik99@gmail.com">
              cvamsik99@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
