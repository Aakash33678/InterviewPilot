import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  refreshToken: text('refreshToken'),
  accessToken: text('accessToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// InterviewAI app tables
export const resume = pgTable('resume', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  fileName: text('fileName').notNull(),
  fileUrl: text('fileUrl').notNull(),
  rawText: text('rawText').notNull(),
  parsedData: jsonb('parsedData'),
  uploadedAt: timestamp('uploadedAt').notNull().defaultNow(),
  isActive: boolean('isActive').notNull().default(true),
})

export const interview = pgTable('interview', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  resumeId: text('resumeId').notNull(),
  jobTitle: text('jobTitle').notNull(),
  jobDescription: text('jobDescription'),
  interviewType: text('interviewType').notNull().default('technical'),
  status: text('status').notNull().default('in_progress'),
  startedAt: timestamp('startedAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
  totalScore: real('totalScore'),
})

export const question = pgTable('question', {
  id: text('id').primaryKey(),
  interviewId: text('interviewId').notNull(),
  questionNumber: integer('questionNumber').notNull(),
  questionText: text('questionText').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  generatedAt: timestamp('generatedAt').notNull().defaultNow(),
})

export const answer = pgTable('answer', {
  id: text('id').primaryKey(),
  questionId: text('questionId').notNull(),
  rawTranscript: text('rawTranscript').notNull(),
  editedTranscript: text('editedTranscript'),
  duration: integer('duration'),
  recordedAt: timestamp('recordedAt').notNull().defaultNow(),
})

export const evaluation = pgTable('evaluation', {
  id: text('id').primaryKey(),
  answerId: text('answerId').notNull(),
  score: real('score').notNull(),
  feedback: text('feedback').notNull(),
  strengths: text('strengths').array(),
  improvements: text('improvements').array(),
  evaluatedAt: timestamp('evaluatedAt').notNull().defaultNow(),
})

// Relations
export const userRelations = relations(user, ({ many }) => ({
  resumes: many(resume),
  interviews: many(interview),
}))

export const resumeRelations = relations(resume, ({ one, many }) => ({
  user: one(user, { fields: [resume.userId], references: [user.id] }),
  interviews: many(interview),
}))

export const interviewRelations = relations(interview, ({ one, many }) => ({
  user: one(user, { fields: [interview.userId], references: [user.id] }),
  resume: one(resume, { fields: [interview.resumeId], references: [resume.id] }),
  questions: many(question),
}))

export const questionRelations = relations(question, ({ one, many }) => ({
  interview: one(interview, {
    fields: [question.interviewId],
    references: [interview.id],
  }),
  answers: many(answer),
}))

export const answerRelations = relations(answer, ({ one, many }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
  evaluation: one(evaluation),
}))

export const evaluationRelations = relations(evaluation, ({ one }) => ({
  answer: one(answer, { fields: [evaluation.answerId], references: [answer.id] }),
}))
