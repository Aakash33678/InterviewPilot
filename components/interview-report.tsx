"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { getInterviewReport } from "@/app/actions/interview";

interface ScoreData {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

type ReportData = Awaited<ReturnType<typeof getInterviewReport>>;

export function InterviewReport({ report }: { report: ReportData }) {
  const calculateStats = () => {
    const evaluations = report.qna
      .map((q) => q.evaluation)
      .filter((e) => e !== null) as ScoreData[];
    const scores = evaluations.map((e) => e.score);
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      average: avgScore.toFixed(1),
      highest: highestScore.toFixed(1),
      lowest: lowestScore.toFixed(1),
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
          <p className="text-3xl font-bold">
            {report.interview.totalScore !== null
              ? report.interview.totalScore
              : "N/A"}
            /10
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground mb-1">
            Average Question Score
          </p>
          <p className="text-3xl font-bold">{stats.average}/10</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground mb-1">
            Questions Answered
          </p>
          <p className="text-3xl font-bold">{report.qna.length}</p>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Detailed Feedback</h2>

        {report.qna.map((item, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            {/* Question Header */}
            <div className="bg-muted p-4 border-b">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">
                  Question {item.question.questionNumber}
                </h3>
                {item.evaluation && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Score: {item.evaluation.score.toFixed(1)}/10
                    </span>
                    <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(item.evaluation.score / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm">{item.question.questionText}</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                  {item.question.category}
                </span>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                  {item.question.difficulty}
                </span>
              </div>
            </div>

            {/* Answer & Evaluation */}
            <div className="p-4 space-y-4">
              {item.evaluation && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      {item.evaluation.feedback}
                    </p>
                  </div>

                  {item.evaluation.strengths &&
                    item.evaluation.strengths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-700">
                          Strengths
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {item.evaluation.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {item.evaluation.improvements &&
                    item.evaluation.improvements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-amber-700">
                          Areas for Improvement
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {item.evaluation.improvements.map(
                            (improvement, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">→</span>
                                <span>{improvement}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </>
              )}

              {/* Your Answer */}
              <div className="bg-muted rounded p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Your Answer
                </p>
                <p className="text-sm">
                  {item.answer.editedTranscript || item.answer.rawTranscript}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">Start Another Interview</Button>
        </Link>
      </div>
    </div>
  );
}
