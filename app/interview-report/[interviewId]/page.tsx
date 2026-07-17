import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInterviewReport } from "@/app/actions/interview";
import { InterviewReport } from "@/components/interview-report";

type Props = {
  params: Promise<{
    interviewId: string;
  }>;
};

export default async function InterviewReportPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    const report = await getInterviewReport((await params).interviewId);

    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interview Report</h1>
            <p className="text-muted-foreground">
              {report.interview.jobTitle} • 
              {report.interview.completedAt
                ? " Completed" + " " + report.interview.completedAt.toLocaleDateString()
                : " Not completed"}
            </p>
          </div>

          <InterviewReport report={report} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading report:", error);
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Error Loading Report</h1>
          <p className="text-muted-foreground">
            Failed to load the interview report.
          </p>
        </div>
      </main>
    );
  }
}
