import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

interface ResumeData {
  skills?: string[]
  experience?: string[]
  education?: string[]
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  resumeData: ResumeData | null,
  numberOfQuestions: number = 10
): Promise<Array<{ question: string; category: string; difficulty: string }>> {
  const prompt = `You are an expert technical interviewer. Generate ${numberOfQuestions} interview questions for a candidate applying for the position of ${jobTitle}.

Job Description:
${jobDescription}

${
  resumeData?.skills?.length
    ? `Candidate's Skills: ${resumeData.skills.join(', ')}`
    : ''
}

${
  resumeData?.experience?.length
    ? `Candidate's Experience Summary: ${resumeData.experience.slice(0, 3).join('; ')}`
    : ''
}

Generate questions that:
1. Are relevant to the job description
2. Assess technical and soft skills
3. Have varying difficulty levels (easy, medium, hard)
4. Are open-ended and behavioral

Format your response as a JSON array with objects containing:
- "question": The interview question
- "category": One of (technical, behavioral, problem_solving, communication)
- "difficulty": One of (easy, medium, hard)

Return ONLY the JSON array, no other text.`

  try {
    const result = await generateText({
      model: google('gemini-3.1-flash-lite'),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
      maxRetries: 1,
    })

    // Parse the response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI')
    }

    const questions = JSON.parse(jsonMatch[0])
    return questions.slice(0, numberOfQuestions)
  } catch (error) {
    console.error('Error generating questions:', error)
    throw new Error('"The AI service is temporarily busy. Please try again in a few moments."')
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  jobTitle: string
): Promise<{
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}> {
  const prompt = `You are an expert interviewer evaluating a candidate's response to an interview question for a ${jobTitle} position.

Question: ${question}

Candidate's Answer: ${answer}

Evaluate the response on a scale of 1-10 and provide:
1. A score (1-10)
2. Overall feedback (2-3 sentences)
3. List 2-3 strengths in the response
4. List 2-3 areas for improvement

Format your response as JSON with keys: score (number), feedback (string), strengths (array of strings), improvements (array of strings).

Return ONLY the JSON object, no other text.`

  try {
    const result = await generateText({
      model: google('gemini-3.1-flash-lite'),
      prompt,
      temperature: 0.5,
      maxOutputTokens: 1000,
      maxRetries: 1,
    })

    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI')
    }

    const evaluation = JSON.parse(jsonMatch[0])
    return {
      score: Math.min(10, Math.max(1, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
    }
  } catch (error) {
    console.error('Error evaluating answer:', error)
    throw new Error('"The AI service is temporarily busy. Please try again in a few moments."')
  }
}
