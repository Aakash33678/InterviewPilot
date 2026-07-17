import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { ResumeUploadForm } from '@/components/resume-upload-form'

export default async function UploadResumePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
          <p className="text-muted-foreground">Upload a PDF resume to get started with your mock interview</p>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <ResumeUploadForm />
        </div>
      </div>
    </main>
  )
}
