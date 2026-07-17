import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { InterviewInterface } from '@/components/interview-interface'

type Props = {
  params: Promise<{
    interviewId: string
  }>
}

export default async function InterviewPage({
  params
}: Props
) {
  const { interviewId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
          <p className="text-muted-foreground">
            Answer each question carefully. You can edit your transcript before submitting.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <InterviewInterface interviewId={interviewId} />
        </div>
      </div>
    </main>
  )
}
