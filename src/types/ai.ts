export type BugType = 
  | 'OFF_BY_ONE'
  | 'ASYNC_AWAIT'
  | 'MUTATION_ERROR'
  | 'LOGICAL_OPERATOR'
  | 'RETURN_TYPE'
  | 'SYNTAX_ERROR';

export interface ErrorSpec {
  id: string;
  line: number;
  column: number;
  type: BugType;
  message: string;
  fixHint?: string;
  severity: 'error' | 'warning';
  originalNodeSnippet?: string;
  brokenNodeSnippet?: string;
}

export interface AIAnalysisResult {
  originalCode: string;
  brokenCode: string;
  criticalErrors: ErrorSpec[];
}
