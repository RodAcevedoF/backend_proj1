import * as XLSX from 'xlsx';
import {
  IFileParser,
  ParseResult,
  ParsedRow,
} from '@/features/article/domain/ports/outbound/ifile-parser';

type ColumnMapping = Record<string, keyof ParsedRow>;

const DEFAULT_COLUMN_MAP: ColumnMapping = {
  title: 'title',
  name: 'title',
  content: 'content',
  abstract: 'content',
  description: 'content',
  body: 'content',
  tags: 'tags',
  keywords: 'tags',
  url: 'url',
  link: 'url',
  authors: 'authors',
  author: 'authors',
  date: 'publishedAt',
  published: 'publishedAt',
  publishedat: 'publishedAt',
  published_at: 'publishedAt',
};

export class SpreadsheetParser implements IFileParser {
  private readonly supportedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/csv',
  ];

  getSupportedTypes(): string[] {
    return this.supportedTypes;
  }

  async parse(buffer: Buffer, mimeType: string): Promise<ParseResult> {
    if (!this.supportedTypes.includes(mimeType)) {
      return {
        rows: [],
        headers: [],
        errors: [{ row: 0, message: `Unsupported file type: ${mimeType}` }],
      };
    }

    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });

      if (rawData.length === 0) {
        return {
          rows: [],
          headers: [],
          errors: [{ row: 0, message: 'File is empty or has no data rows' }],
        };
      }

      const headers = Object.keys(rawData[0]);
      const columnMap = this.buildColumnMap(headers);
      const rows: ParsedRow[] = [];
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < rawData.length; i++) {
        try {
          const row = this.mapRow(rawData[i], columnMap);
          rows.push(row);
        } catch (err) {
          errors.push({
            row: i + 2, // +2 for header row and 1-indexed
            message: err instanceof Error ? err.message : 'Failed to parse row',
          });
        }
      }

      return { rows, headers, errors };
    } catch (err) {
      return {
        rows: [],
        headers: [],
        errors: [
          {
            row: 0,
            message:
              err instanceof Error ? err.message : 'Failed to parse file',
          },
        ],
      };
    }
  }

  private buildColumnMap(headers: string[]): Map<string, keyof ParsedRow> {
    const map = new Map<string, keyof ParsedRow>();

    for (const header of headers) {
      const normalized = header.toLowerCase().trim().replace(/\s+/g, '_');
      const mapped = DEFAULT_COLUMN_MAP[normalized];
      if (mapped) {
        map.set(header, mapped);
      }
    }

    return map;
  }

  private mapRow(
    raw: Record<string, unknown>,
    columnMap: Map<string, keyof ParsedRow>
  ): ParsedRow {
    const row: ParsedRow = {};

    for (const [originalCol, value] of Object.entries(raw)) {
      const mappedField = columnMap.get(originalCol);

      if (mappedField) {
        const stringValue = String(value ?? '').trim();

        if (mappedField === 'tags' || mappedField === 'authors') {
          // Split comma-separated values
          row[mappedField] = stringValue
            ? stringValue.split(',').map((s) => s.trim())
            : [];
        } else {
          row[mappedField] = stringValue || undefined;
        }
      } else {
        // Preserve unmapped columns
        row[originalCol] = value;
      }
    }

    return row;
  }
}
