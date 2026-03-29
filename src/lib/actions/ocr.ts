"use server"

import { GoogleGenerativeAI, Part } from "@google/generative-ai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function extractReceiptData(base64Image: string, mediaType: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    throw new Error("Unauthorized access. Must be logged in as an employee.")
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.")
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  const prompt = `You are a receipt parsing assistant. Extract the following details from the receipt image provided.
You MUST output ONLY valid JSON without any markdown formatting or extra text.

Return exactly this structure:
{
  "amount": <number>, 
  "currency": "<string currency code (e.g. USD, EUR, INR)>",
  "merchant": "<string>",
  "category": "<string - MUST BE ONE OF: TRAVEL, MEALS, SOFTWARE, OFFICE, OTHER>",
  "date": "<YYYY-MM-DD>",
  "description": "<string brief description>"
}
If a field cannot be found, provide a reasonable default (e.g. amount 0, current date) or "Unknown".
Do not wrap it in \`\`\`json blocks. Just the raw JSON object.`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const parts: Part[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mediaType,
          data: base64Image
        }
      }
    ]

    const result = await model.generateContent(parts)
    const responseText = result.response.text()

    // Safety matching in case Gemini adds markdown
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response")
    }
    
    return JSON.parse(jsonMatch[0])
    
  } catch (error: any) {
    console.error("OCR Error:", error)
    throw new Error(`Failed to extract receipt data using Gemini: ${error.message}`)
  }
}
