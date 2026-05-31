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
    You are an extremely strict, hardcore code analyzer. 
    Language: ${language}
    
    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`
    
    Your task is to detect EVERY SINGLE bug in this code. This includes:
    1. Syntax errors
    2. Logical errors
    3. Type errors
    4. Missing parentheses/brackets
    5. Undefined variables or functions
    6. Incorrect method calls (e.g. using .split() on an object that doesn't support it)
    7. Semantic errors (logic that will fail at runtime)
    
    Respond ONLY with a valid JSON object in this EXACT format:
    {
      "errors": [
        { "type": "syntax", "description": "missing colon" },
        { "type": "logic", "description": "map object has no split method" }
      ]
    }
    If the code is absolutely perfect and bug-free, return { "errors": [] }.
    Do NOT include markdown formatting like \`\`\`json. Just the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Strip markdown formatting if the model still returns it
    const cleanJson = text.replace(/```json/i, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanJson);
    
    if (data && Array.isArray(data.errors)) {
      console.log('[AI] Detected ' + data.errors.length + ' errors: ', data.errors);
      return data.errors.length;
    }
    return 0;
  } catch (error) {
    console.error('[AI Code Analysis Failed]:', error);
    return 0; // Fallback to 0 if API fails
  }
}
