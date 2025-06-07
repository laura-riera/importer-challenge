import { Injectable } from '@nestjs/common';
import { normalizeCountryCode, normalizeSectorName } from './text-normalizer';

@Injectable()
export class CsvDeduplicatorService {
  deduplicate(rows: Record<string, string>[]): {
    rows: Record<string, string>[];
    removed: number;
  } {
    if (rows.length === 0) return { rows: [], removed: 0 };

    const columns = Object.keys(rows[0]);
    const seen = new Set<string>();
    const deduped: Record<string, string>[] = [];
    let removed = 0;

    const normalizeCell = (col: string, val: unknown): string => {
      if (val === null || val === undefined) return '';

      if (col.toLowerCase() === 'country' && typeof val === 'string') {
        return normalizeCountryCode(val);
      }

      if (
        (col.toLowerCase() === 'sector' ||
          col.toLowerCase() === 'parentsector') &&
        typeof val === 'string'
      ) {
        return normalizeSectorName(val) ?? '';
      }

      if (typeof val === 'number') return val.toString();

      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) return parsed.toString();
        return val.trim();
      }

      return '';
    };

    for (const row of rows) {
      const key = columns.map((col) => normalizeCell(col, row[col])).join('|');
      if (seen.has(key)) {
        removed++;
        continue;
      }
      seen.add(key);
      deduped.push(row);
    }

    return { rows: deduped, removed };
  }
}
