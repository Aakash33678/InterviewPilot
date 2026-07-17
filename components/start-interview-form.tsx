"use client";

import { useState } from "react";
import { startInterview } from "@/app/actions/interview";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function StartInterviewForm({ resumeId }: { resumeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    questionCount: 10,
  });
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await startInterview(
        resumeId,
        formData.jobTitle,
        formData.jobDescription,
        formData.questionCount,
      );
      router.push(`/interview/${result.interviewId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start interview",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium mb-2">
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          placeholder="e.g., Senior Software Engineer"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="block text-sm font-medium mb-2"
        >
          Job Description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleChange}
          placeholder="Paste the job description here (optional but recommended for more relevant questions)"
          rows={6}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Questions
        </label>

        <div className="grid grid-cols-4 gap-3">
          {[5, 10, 15, 20].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  questionCount: count,
                }))
              }
              disabled={loading}
              className={`rounded-lg border py-3 font-medium transition ${
                formData.questionCount === count
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:border-primary"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 mb-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> If you want to take the interview using your
          voice, please ensure microphone access is enabled in your browser. You
          can still type your answers if microphone access is unavailable.
        </p>
        <p className="text-sm text-amber-800">
          <strong>Incomplete Interview:</strong> If you leave or close the
          interview before completing all questions, your interview will be
          marked as incomplete and you may need to start a new interview but you can view that report.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Starting Interview..." : "Start Interview"}
      </Button>
    </form>
  );
}
