import { extractText } from "unpdf";
import { generateText } from "ai";
import { google } from "@/lib/services/ai";

export async function parseResumeFromBuffer(buffer: Buffer) {

  const result = await extractText(new Uint8Array(buffer));

  const resumeText = result.text.join("\n");

  const prompt = `
You are an expert resume parser.

Extract the resume into JSON.

Return ONLY valid JSON.

The JSON MUST exactly follow this schema:

{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "summary": "",
  "skills": [],
  "education": [
    {
      "degree": "",
      "institute": "",
      "year": "",
      "cgpa": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": []
    }
  ],
  "certifications": [],
  "languages": []
}

Do not add extra keys.
Do not rename keys.
If information is unavailable, use "" or [].

Resume:

${resumeText}
`;

  const resultAI = await generateText({
    model: google("gemini-3.1-flash-lite"),
    prompt,
    temperature: 0,
    maxOutputTokens: 1200,
  });

  let parsed: any = {};

  try {
    const cleaned = resultAI.text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

    parsed = JSON.parse(cleaned);
  } catch {
    console.log("Gemini Response:");
console.log(resultAI.text);
    const json = resultAI.text.match(/\{[\s\S]*\}/);

    if (!json) {
      throw new Error("Invalid JSON returned by Gemini");
    }

    parsed = JSON.parse(json[0]);
  }

  return {
    ...parsed,
    rawText: resumeText,
  };
}