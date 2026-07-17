import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { completeInterview } from '@/app/actions/interview'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
  params: Promise<{
    interviewId: string
  }>
}

export default async function InterviewCompletePage({
  params,
}: Props) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  try {
    const result = await completeInterview((await params).interviewId)

    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-card rounded-lg border p-8 text-center space-y-6">
            <div className="text-5xl">✨</div>
            <h1 className="text-3xl font-bold">Interview Complete!</h1>

            <div className="bg-muted rounded-lg p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Your Overall Score</p>
              <p className="text-4xl font-bold text-primary">
                {result.totalScore.toFixed(1)}/10
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {result.questionCount} questions
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Your interview has been evaluated by AI. Check your detailed report for feedback on each answer.
            </p>

            <div className="flex flex-col gap-3">
              <Link href={`/interview-report/${(await params).interviewId}`} className="w-full">
                <Button className="w-full">View Detailed Report</Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error completing interview:', error)
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-card rounded-lg border p-8 text-center space-y-6">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">
              Failed to complete the interview. Please try again.
            </p>
            <Link href="/">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }
}
