import { deleteResume, getResumes } from '@/app/actions/resume'
import { getUserId } from '@/lib/user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await getUserId() // Check auth
    const resumes = await getResumes()
    return NextResponse.json(resumes)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
