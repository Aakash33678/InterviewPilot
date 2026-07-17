import { getInterviews } from '@/app/actions/interview'
import { getUserId } from '@/lib/user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await getUserId() // Check auth
    const interviews = await getInterviews()
    return NextResponse.json(interviews)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
