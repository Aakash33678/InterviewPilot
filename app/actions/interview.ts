'use server'

import { getUserId } from '@/lib/user'
import { db } from '@/lib/db'
import {
  interview,
  question,
  answer,
  evaluation,
  resume as resumeTable,
} from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { generateInterviewQuestions, evaluateAnswer } from '@/lib/services/ai-service'
import crypto from 'crypto'

export async function startInterview(
  resumeId: string,
  jobTitle: string,
  jobDescription: string,
  questionCount: number
) {
  const userId = await getUserId()

  // Get the resume
  const selectedResume = await db
    .select()
    .from(resumeTable)
    .where(and(eq(resumeTable.id, resumeId), eq(resumeTable.userId, userId)))
    .limit(1)

  if (!selectedResume.length) {
    throw new Error('Resume not found')
  }

  const interviewId = crypto.randomUUID()

  // Create interview record
  await db.insert(interview).values({
    id: interviewId,
    userId,
    resumeId,
    jobTitle,
    jobDescription,
    status: 'in_progress',
  })

  // Generate questions
  const parsedData = selectedResume[0].parsedData as any
  const generatedQuestions = await generateInterviewQuestions(
    jobTitle,
    jobDescription,
    parsedData,
    questionCount
  )

  // Store questions in database
  for (let i = 0; i < generatedQuestions.length; i++) {
    const q = generatedQuestions[i]
    await db.insert(question).values({
      id: crypto.randomUUID(),
      interviewId,
      questionNumber: i + 1,
      questionText: q.question,
      category: q.category,
      difficulty: q.difficulty,
    })
  }

  return {
    interviewId,
    jobTitle,
    resumeFileName: selectedResume[0].fileName,
  }
}

export async function getInterviewQuestions(interviewId: string) {
  const userId = await getUserId()

  // Verify the interview belongs to the user
  const interviewData = await db
    .select()
    .from(interview)
    .where(and(eq(interview.id, interviewId), eq(interview.userId, userId)))
    .limit(1)

  if (!interviewData.length) {
    throw new Error('Interview not found')
  }

  return db
    .select()
    .from(question)
    .where(eq(question.interviewId, interviewId))
    .orderBy(question.questionNumber)
}

export async function submitAnswer(
  questionId: string,
  transcript: string,
  duration: number
) {
  const userId = await getUserId()

  // Verify the question belongs to the user
  const questionData = await db
    .select()
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1)

  if (!questionData.length) {
    throw new Error('Question not found')
  }

  const q = questionData[0]

  // Verify interview belongs to user
  const interviewData = await db
    .select()
    .from(interview)
    .where(
      and(
        eq(interview.id, q.interviewId),
        eq(interview.userId, userId)
      )
    )
    .limit(1)

  if (!interviewData.length) {
    throw new Error('Interview not found')
  }

  const answerId = crypto.randomUUID()
  const jobTitle = interviewData[0].jobTitle

  // Store answer
  await db.insert(answer).values({
    id: answerId,
    questionId,
    rawTranscript: transcript,
    duration,
  })

  // Evaluate the answer
  const evaluation_data = await evaluateAnswer(
    q.questionText,
    transcript,
    jobTitle
  )

  // Store evaluation
  const evaluationId = crypto.randomUUID()
  await db.insert(evaluation).values({
    id: evaluationId,
    answerId,
    score: evaluation_data.score,
    feedback: evaluation_data.feedback,
    strengths: evaluation_data.strengths,
    improvements: evaluation_data.improvements,
  })

  return {
    answerId,
    evaluation: evaluation_data,
  }
}

export async function completeInterview(interviewId: string) {
  const userId = await getUserId()

  // Get all answers for this interview with their evaluations
  const interviewData = await db
    .select()
    .from(interview)
    .where(and(eq(interview.id, interviewId), eq(interview.userId, userId)))
    .limit(1)

  if (!interviewData.length) {
    throw new Error('Interview not found')
  }

  // Get all questions and their answers/evaluations
  const questions_data = await db
    .select()
    .from(question)
    .where(eq(question.interviewId, interviewId))

  let totalScore = 0
  let answerCount = 0

  for (const q of questions_data) {
    const answers = await db
      .select()
      .from(answer)
      .where(eq(answer.questionId, q.id))

    for (const a of answers) {
      const evals = await db
        .select()
        .from(evaluation)
        .where(eq(evaluation.answerId, a.id))

      if (evals.length > 0) {
        totalScore += evals[0].score
        answerCount++
      }
    }
  }

  const averageScore = answerCount > 0 ? totalScore / answerCount : 0

  // Update interview
  await db
    .update(interview)
    .set({
      status: 'completed',
      completedAt: new Date(),
      totalScore: averageScore,
    })
    .where(eq(interview.id, interviewId))

  return { totalScore: averageScore, questionCount: questions_data.length }
}

export async function getInterviews() {
  const userId = await getUserId()

  return db
    .select()
    .from(interview)
    .where(eq(interview.userId, userId))
    .orderBy(desc(interview.startedAt))
}

export async function getInterviewReport(interviewId: string) {
  const userId = await getUserId()

  // Get interview
  const interviewData = await db
    .select()
    .from(interview)
    .where(and(eq(interview.id, interviewId), eq(interview.userId, userId)))
    .limit(1)

  if (!interviewData.length) {
    throw new Error('Interview not found')
  }

  // Get all Q&A with evaluations
  const questions_data = await db
    .select()
    .from(question)
    .where(eq(question.interviewId, interviewId))

  const qnaData = []

  for (const q of questions_data) {
    const answers_data = await db
      .select()
      .from(answer)
      .where(eq(answer.questionId, q.id))

    if (answers_data.length > 0) {
      const a = answers_data[0]
      const evals = await db
        .select()
        .from(evaluation)
        .where(eq(evaluation.answerId, a.id))

      qnaData.push({
        question: q,
        answer: a,
        evaluation: evals[0] || null,
      })
    }
  }

  return {
    interview: interviewData[0],
    qna: qnaData,
  }
}
