'use server'

import { getUserId } from '@/lib/user'
import { db } from '@/lib/db'
import { resume } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { parseResumeFromBuffer } from '@/lib/services/resume-parser'
import { uploadResumeToCloudinary } from '@/lib/uploadResume'
import crypto from 'crypto'

export async function uploadResume(formData: FormData) {
  const userId = await getUserId()

  const file = formData.get('file') as File

  if (!file) {
    throw new Error('No file provided')
  }

  if (!file.type.includes('pdf')) {
    throw new Error('Only PDF files are supported')
  }
  if( file.size > 10  * 1024 * 1024) { // 10MB limit
    throw new Error('File size exceeds 10MB limit')
  }

  const buffer = await file.arrayBuffer()
  const bufferNode = Buffer.from(buffer)

  // Default parsed object
  let parsed: any = {
  rawText: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  languages: [],
}

  try {
    parsed = await parseResumeFromBuffer(bufferNode)
  } catch (error) {
    console.error('Resume parsing failed, saving upload anyway:', error)
  }

  const resumeId = crypto.randomUUID()

  const uploaded = await uploadResumeToCloudinary(bufferNode);

  const fileUrl = uploaded.secure_url;

  const newResume = await db
    .insert(resume)
    .values({
      id: resumeId,
      userId,
      fileName: file.name,
      fileUrl,

      rawText: parsed.rawText ?? "",
      parsedData: parsed,

      isActive: true,
    })
    .returning()

  return newResume[0]
}

export async function getResumes() {
  const userId = await getUserId()

  return db
    .select({
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      uploadedAt: resume.uploadedAt,
      isActive: resume.isActive,
    })
    .from(resume)
    .where(eq(resume.userId, userId))
    .orderBy(desc(resume.uploadedAt))
}
export async function deleteResume(resumeId: string) {
  const userId = await getUserId();

    return db
    .delete(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))
    .returning();
}

export async function setActiveResume(resumeId: string) {
  const userId = await getUserId()

  await db
    .update(resume)
    .set({ isActive: false })
    .where(eq(resume.userId, userId))

  return db
    .update(resume)
    .set({ isActive: true })
    .where(and(eq(resume.id, resumeId), eq(resume.userId, userId)))
    .returning()
}

export async function getActiveResume() {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(resume)
    .where(and(eq(resume.userId, userId), eq(resume.isActive, true)))
    .limit(1)

  return result[0] || null
}
