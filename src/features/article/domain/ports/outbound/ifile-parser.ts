export interface ParsedRow {
  title?: string;
  content?: string;
  tags?: string[];
  url?: string;
  authors?: string[];
  publishedAt?: string;
  [key: string]: unknown;
}

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  headers: string[];
  errors: ParseError[];
}

export interface IFileParser {
  parse(buffer: Buffer, mimeType: string): Promise<ParseResult>;
  getSupportedTypes(): string[];
}
