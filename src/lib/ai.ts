import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeCodeErrors(code: string, language: string): Promise<number> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[AI] GEMINI_API_KEY not set. Falling back to 0 errors.');
    return 0;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are a strict code analyzer and syntax checker.
    Language: ${language}
    
    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`
    
    Count the exact total number of syntax and logical errors in this code. 
    Respond ONLY with a valid JSON object in this exact format:
    {
      "errorCount": number
    }
    Do NOT include markdown formatting like \`\`\`json. Just the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Strip markdown formatting if the model still returns it
    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanJson);
    
    if (typeof data.errorCount === 'number') {
      return data.errorCount;
    }
    return 0;
  } catch (error) {
    console.error('[AI Code Analysis Failed]:', error);
    return 0; // Fallback to 0 if API fails
  }
}
