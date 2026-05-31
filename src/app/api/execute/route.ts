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
      go: 60,
      rust: 73,
      php: 68,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return Response.json({ error: `Unsupported language: ${language}` }, { status: 400 });
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
    const stderrOut = decodeBase64(data.stderr);
    const stdoutOut = decodeBase64(data.stdout);

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
