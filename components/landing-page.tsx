import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  FileText,
  Mic,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Analysis",
    description:
      "Upload your resume and let AI generate interview questions based on your experience.",
  },
  {
    icon: Brain,
    title: "AI Mock Interviews",
    description:
      "Practice realistic technical and behavioral interviews anytime.",
  },
  {
    icon: Mic,
    title: "Voice Conversations",
    description:
      "Talk naturally with an AI interviewer and improve your communication skills.",
  },
  {
    icon: BarChart3,
    title: "Detailed Feedback",
    description:
      "Receive scores, strengths, weaknesses, and personalized suggestions.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <h1 className="text-xl font-bold">InterviewPilot</h1>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Login</Button>
            </Link>

            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="rounded-full border bg-muted px-4 py-1 text-sm text-muted-foreground">
           AI-Powered Interview Preparation
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          Land your dream job with
          <span className="text-primary"> AI mock interviews.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Upload your resume, practice personalized interviews, and receive
          instant AI feedback to improve your confidence before the real
          interview.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-20 sm:grid-cols-3">
        {[
          ["AI Generated", "Personalized Questions"],
          ["Instant", "Performance Feedback"],
          ["Resume-Based", "Interview Experience"],
        ].map(([title, subtitle]) => (
          <div
            key={title}
            className="rounded-xl border bg-card p-6 text-center shadow-sm"
          >
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Everything you need</h2>

          <p className="mt-3 text-muted-foreground">
            Practice smarter with AI-powered interview preparation.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold">{feature.title}</h3>

                <p className="mt-3 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <h2 className="text-3xl font-bold">
            Ready to ace your next interview?
          </h2>

          <p className="mt-4 text-muted-foreground">
            Create your account and start practicing with InterviewPilot today.
          </p>

          <Link href="/sign-up">
            <Button size="lg" className="mt-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto  max-w-6xl text-center  px-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 InterviewPilot. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}