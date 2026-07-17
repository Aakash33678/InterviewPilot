import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { StartInterviewForm } from '@/components/start-interview-form'
interface PageProps {
  params: Promise<{
    resumeId: string
  }>
}
export default async function StartInterviewPage({
 params,
}: PageProps) {
  const { resumeId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Start Mock Interview</h1>
          <p className="text-muted-foreground">
            Tell us about the role you&apos;re interviewing for
          </p>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <StartInterviewForm resumeId={resumeId} />
        </div>
      </div>
    </main>
  )
}
