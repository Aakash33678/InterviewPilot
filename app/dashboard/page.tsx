
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { LogoutButton } from "@/components/logout";
import LandingPage from "@/components/landing-page";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">
              Welcome back, {session.user.name || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Practice interviews with AI-powered feedback
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Homepage</Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
        <Dashboard />
      </div>
    </main>
  );
}
