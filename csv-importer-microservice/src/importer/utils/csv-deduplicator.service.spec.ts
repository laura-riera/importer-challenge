import { CsvDeduplicatorService } from './csv-deduplicator.service';

describe('CsvDeduplicatorService', () => {
  let service: CsvDeduplicatorService;

  beforeEach(() => {
    service = new CsvDeduplicatorService();
  });

  it('should deduplicate rows using normalized values', () => {
    const input = [
      {
        country: ' usa ',
        sector: 'Energy ',
        parentsector: '',
        '1990': '100.50',
      },
      {
        country: 'USA',
        sector: 'energy',
        parentsector: '',
        '1990': '100.5',
      },
      {
        country: 'CAN',
        sector: 'Transport',
        parentsector: '',
        '1990': '200.0',
      },
    ];

    const result = service.deduplicate(input);

    expect(result.rows).toHaveLength(2);
    expect(result.removed).toBe(1);
  });

  it('should return zero removed if all rows are unique', () => {
    const input = [
      { country: 'FRA', sector: 'Energy', parentsector: '', '1990': '150' },
      { country: 'DEU', sector: 'Transport', parentsector: '', '1990': '180' },
    ];

    const result = service.deduplicate(input);

    expect(result.rows).toHaveLength(2);
    expect(result.removed).toBe(0);
  });

  it('should return empty if input is empty', () => {
    const result = service.deduplicate([]);
    expect(result.rows).toEqual([]);
    expect(result.removed).toBe(0);
  });
});
