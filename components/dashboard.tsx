"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface Interview {
  id: string;
  jobTitle: string;
  status: string;
  totalScore: number | null;
  startedAt: string;
  completedAt: string | null;
}

export function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumeRes = await fetch("/api/resumes");
        const interviewRes = await fetch("/api/interviews");

        if (resumeRes.ok) setResumes(await resumeRes.json());
        if (interviewRes.ok) setInterviews(await interviewRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteResume = async (resumeId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?",
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete resume");
      }

      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      alert("Failed to delete resume.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-lg font-large text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Resumes Section */}
      <div className="grid gap-4 mb-8 md:grid-cols-3">
        <div className="rounded-xl border p-5 bg-card">
          <p className="text-sm text-muted-foreground">Resumes</p>
          <h2 className="text-3xl font-bold">{resumes.length}</h2>
        </div>

        <div className="rounded-xl border p-5 bg-card">
          <p className="text-sm text-muted-foreground">Interviews</p>
          <h2 className="text-3xl font-bold">{interviews.length}</h2>
        </div>

        <div className="rounded-xl border p-5 bg-card">
          <p className="text-sm text-muted-foreground">Average Score</p>

          <h2 className="text-3xl font-bold">
            {interviews.length === 0
              ? "--"
              : (
                  interviews
                    .filter((i) => i.totalScore !== null)
                    .reduce((sum, i) => sum + (i.totalScore ?? 0), 0) /
                  interviews.filter((i) => i.totalScore !== null).length
                ).toFixed(1)}
          </h2>
        </div>
      </div>
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Resumes</h2>

            <p className="text-sm text-muted-foreground">
              Manage resumes for your interviews.
            </p>
          </div>

          <Link href="/upload-resume">
            <Button>Upload Resume</Button>
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              No resumes uploaded yet
            </p>
            <Link href="/upload-resume">
              <Button>Upload Your First Resume</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium wrap-break-words">{resume.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded{" "}
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link
                      href={`/start-interview/${resume.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full sm:w-auto">
                        Start Interview
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        window.open(
                          resume.fileUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      View Resume
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleDeleteResume(resume.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interviews Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Interview History</h2>

        {interviews.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No interviews yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition"
              >
                <div>
                  <p className="font-medium">{interview.jobTitle}</p>
                  <p className="text-sm text-muted-foreground capitalize py-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                          ${
                            interview.status === "completed"
                              ? "bg-green-100 text-black"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                    >
                      {interview.status}
                    </span>
                    {interview.totalScore !== null &&
                      ` • Score: ${interview.totalScore.toFixed(1)}/10`}
                  </p>
                  <p className="text-xs text-muted-foreground py-1">
                    {new Date(interview.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/interview-report/${interview.id}`}>
                  <Button variant="outline">View Report</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
