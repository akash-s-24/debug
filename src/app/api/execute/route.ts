export async function POST(req: Request) {
  try {
    const { code, language, stdin } = (await req.json()) as { code: string; language: string; stdin?: string };

    if (!code || !language) {
      return Response.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Map our languages to Judge0 CE language IDs
    const languageMap: Record<string, number> = {
      javascript: 93,
      typescript: 74,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
      go: 60,
      rust: 73,
      php: 68,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return Response.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    // Judge0 saves Java code as Main.java and executes `java Main`. 
    // We must ensure the user has a class named Main.
    if (languageId === 62) {
      const hasMainClass = /\bclass\s+Main\b/.test(code);
      const publicClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      
      if (publicClassMatch && publicClassMatch[1] !== 'Main') {
        return Response.json({ 
          output: `[Java Execution Error]\nYour public class is named '${publicClassMatch[1]}'.\nIn this environment, your main class must be named 'Main' (e.g., public class Main).`
        }, { status: 200 }); // Return 200 so it displays nicely in the terminal as output
      } else if (!hasMainClass) {
        return Response.json({ 
          output: `[Java Execution Error]\nCould not find 'class Main'.\nIn this environment, your code must contain a class named 'Main' with the 'public static void main' method.`
        }, { status: 200 });
      }
    }

    // Encode payload to Base64 to prevent JSON parsing errors with special chars
    const encodedCode = Buffer.from(code).toString('base64');
    const encodedStdin = stdin ? Buffer.from(stdin).toString('base64') : '';

    // Call Judge0 CE public API with base64_encoded=true
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code: encodedCode,
        language_id: languageId,
        stdin: encodedStdin,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: `Execution failed: ${text}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Helper to decode base64
    const decodeBase64 = (b64: string | null) => {
      if (!b64) return null;
      return Buffer.from(b64, 'base64').toString('utf-8');
    };

    // Extract output
    let output = '';
    const compileOut = decodeBase64(data.compile_output);
    let stderrOut = decodeBase64(data.stderr);
    const stdoutOut = decodeBase64(data.stdout);

    // Clean up ugly bash wrapper segfault messages for C/C++
    if (stderrOut && stderrOut.includes('Segmentation fault')) {
      stderrOut = stderrOut.replace(/run\.sh: line \d+:.*Segmentation fault.*/g, '[Segmentation Fault]\nYour program crashed because it tried to access an invalid memory location.\nCommon causes: array out-of-bounds, uninitialized or null pointers, or infinite recursion.');
    }

    if (compileOut) {
      output += `[Compiler Output]\n${compileOut}\n`;
    }
    if (stderrOut) {
      output += `[Error]\n${stderrOut}\n`;
    }
    if (stdoutOut) {
      output += `${stdoutOut}\n`;
    }
    if (!compileOut && !stderrOut && !stdoutOut) {
      output = `[Execution completed with status: ${data.status?.description || 'Unknown'}]`;
    }

    return Response.json({ output: output.trim(), status: data.status?.description }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/execute]', error);
    return Response.json({ error: 'Failed to connect to execution engine' }, { status: 500 });
  }
}
