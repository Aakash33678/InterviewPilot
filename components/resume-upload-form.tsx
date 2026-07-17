"use client";

import { useState } from "react";
import { uploadResume } from "@/app/actions/resume";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ResumeUploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await uploadResume(formData);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-2 border-dashed border-muted rounded-lg p-8">
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-muted-foreground mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <label htmlFor="file" className="cursor-pointer">
            <span className="text-sm font-medium text-primary hover:underline">
              Click to upload
            </span>
          </label>
          <input
            id="file"
            type="file"
            name="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            PDF files up to 10MB
          </p>
          {fileName && (
            <p className="text-sm font-medium mt-2 text-foreground">
              {fileName}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 h-3 w-5 animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">
              Uploading...
            </span>
          </div>
        ) : (
          "Upload Resume"
        )}
      </Button>
    </form>
  );
}
