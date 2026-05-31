export async function POST(req: Request) {
  try {
    const { code, language } = (await req.json()) as { code: string; language: string };

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

    // Call Judge0 CE public API
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: `Execution failed: ${text}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract output
    let output = '';
    if (data.compile_output) {
      output += `[Compiler Output]\n${data.compile_output}\n`;
    }
    if (data.stderr) {
      output += `[Error]\n${data.stderr}\n`;
    }
    if (data.stdout) {
      output += `${data.stdout}\n`;
    }
    if (!data.compile_output && !data.stderr && !data.stdout) {
      output = `[Execution completed with status: ${data.status?.description || 'Unknown'}]`;
    }

    return Response.json({ output: output.trim(), status: data.status?.description }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/execute]', error);
    return Response.json({ error: 'Failed to connect to execution engine' }, { status: 500 });
  }
}
