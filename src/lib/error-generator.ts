import { parseCode, traverse } from './code-parser';
import type { ErrorSpec, BugType } from '../types/ai';

// Simple seeded PRNG (Linear Congruential Generator)
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

interface Candidate {
  start: number;
  end: number;
  type: BugType;
  message: string;
  fixHint: string;
  originalSnippet: string;
  brokenSnippet: string;
}

export class ErrorGenerator {
  static injectErrors(
    code: string,
    player: 'A' | 'B',
    seed: number = Date.now()
  ): { code: string; errors: ErrorSpec[] } {
    const ast = parseCode(code);
    const candidates: Candidate[] = [];
    
    // Helper to get string snippet
    const getSnippet = (start: number, end: number) => code.slice(start, end);

    traverse(ast, {
      BinaryExpression(path: any) {
        const node = path.node;
        if (!node.start || !node.end) return;

        // OFF_BY_ONE
        if (node.operator === '<') {
          candidates.push({
            start: node.start, end: node.end, type: 'OFF_BY_ONE',
            message: 'Possible off-by-one error in loop or condition.',
            fixHint: 'Check if the boundary condition should be strictly less than.',
            originalSnippet: getSnippet(node.start, node.end),
            brokenSnippet: getSnippet(node.start, node.end).replace('<', '<='),
          });
        } else if (node.operator === '<=') {
          candidates.push({
            start: node.start, end: node.end, type: 'OFF_BY_ONE',
            message: 'Boundary condition might exclude the final required iteration.',
            fixHint: 'Consider if it should be inclusive.',
            originalSnippet: getSnippet(node.start, node.end),
            brokenSnippet: getSnippet(node.start, node.end).replace('<=', '<'),
          });
        }

        // LOGICAL_OPERATOR
        if (node.operator === '&&') {
          candidates.push({
            start: node.start, end: node.end, type: 'LOGICAL_OPERATOR',
            message: 'Logical operator mismatch. Expected both conditions to be true?',
            fixHint: 'Verify if you meant AND instead of OR.',
            originalSnippet: getSnippet(node.start, node.end),
            brokenSnippet: getSnippet(node.start, node.end).replace('&&', '||'),
          });
        } else if (node.operator === '===') {
          candidates.push({
            start: node.start, end: node.end, type: 'LOGICAL_OPERATOR',
            message: 'Strict equality was downgraded to loose equality.',
            fixHint: 'Use strict equality (===) to prevent type coercion bugs.',
            originalSnippet: getSnippet(node.start, node.end),
            brokenSnippet: getSnippet(node.start, node.end).replace('===', '=='),
          });
        }
      },
      VariableDeclaration(path: any) {
        const node = path.node;
        if (!node.start || !node.end) return;
        if (node.kind === 'let') {
          candidates.push({
            start: node.start, end: node.end, type: 'MUTATION_ERROR',
            message: 'Variable declared as const but later mutated.',
            fixHint: 'Change const to let if the variable needs to be reassigned.',
            originalSnippet: getSnippet(node.start, node.end),
            brokenSnippet: getSnippet(node.start, node.end).replace(/^let\b/, 'const'),
          });
        }
      },
      AwaitExpression(path: any) {
        const node = path.node;
        if (!node.start || !node.end) return;
        const snippet = getSnippet(node.start, node.end);
        if (snippet.startsWith('await ')) {
          candidates.push({
            start: node.start, end: node.end, type: 'ASYNC_AWAIT',
            message: 'Missing await keyword for asynchronous operation.',
            fixHint: 'Ensure you await the promise before proceeding.',
            originalSnippet: snippet,
            brokenSnippet: snippet.substring(6), // remove "await "
          });
        }
      },
      ReturnStatement(path: any) {
        const node = path.node;
        if (!node.start || !node.end || !node.argument) return;
        
        if (node.argument.type === 'BooleanLiteral') {
          const val = node.argument.value;
          candidates.push({
            start: node.argument.start, end: node.argument.end, type: 'RETURN_TYPE',
            message: 'Function returns incorrect boolean state.',
            fixHint: `Should this return ${!val}?`,
            originalSnippet: getSnippet(node.argument.start, node.argument.end),
            brokenSnippet: val ? 'false' : 'true',
          });
        }
      }
    });

    // Seed depends on player to ensure they get different errors
    const random = mulberry32(seed + (player === 'A' ? 1 : 2));
    
    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Pick up to 5 non-overlapping
    const selected: Candidate[] = [];
    for (const c of candidates) {
      if (selected.length >= 5) break;
      const overlaps = selected.some(s => 
        (c.start >= s.start && c.start <= s.end) || 
        (c.end >= s.start && c.end <= s.end) ||
        (c.start <= s.start && c.end >= s.end)
      );
      if (!overlaps) selected.push(c);
    }

    // Sort descending by start index so string replacements don't offset subsequent indices
    selected.sort((a, b) => b.start - a.start);

    let brokenCode = code;
    const errors: ErrorSpec[] = [];

    for (let i = 0; i < selected.length; i++) {
      const c = selected[i];
      brokenCode = brokenCode.substring(0, c.start) + c.brokenSnippet + brokenCode.substring(c.end);
      
      // Calculate line and column from original code string
      const linesToStart = code.substring(0, c.start).split('\\n');
      const line = linesToStart.length;
      const column = linesToStart[linesToStart.length - 1].length + 1;

      errors.push({
        id: `err_${i}`,
        line,
        column,
        type: c.type,
        message: c.message,
        fixHint: c.fixHint,
        severity: 'error',
        originalNodeSnippet: c.originalSnippet,
        brokenNodeSnippet: c.brokenSnippet
      });
    }

    // Return errors sorted by line number ascending
    errors.sort((a, b) => a.line - b.line);

    return { code: brokenCode, errors };
  }
}
