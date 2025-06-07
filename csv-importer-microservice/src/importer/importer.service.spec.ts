import { ImporterService } from './importer.service';

describe('ImporterService', () => {
  let service: ImporterService;

  const mockValidator = {
    validateAndNormalize: jest.fn(),
  };

  const mockParser = {
    extractRows: jest.fn(),
  };

  const mockDeduplicator = {
    deduplicate: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn(),
  };

  const mockCountryService = {
    getOrCreateCountry: jest.fn(),
  };

  const mockSectorService = {
    getOrCreateSector: jest.fn(),
  };

  const mockEmissionService = {
    getOrCreateEmissionRecord: jest.fn(),
    findAll: jest.fn(),
  };

  const mockAggregator = {
    getSummary: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ImporterService(
      mockValidator as any,
      mockParser as any,
      mockDeduplicator as any,
      mockMapper as any,
      mockCountryService as any,
      mockSectorService as any,
      mockEmissionService as any,
      mockAggregator as any,
    );
  });

  it('should import CSV and return summaries', async () => {
    const csvContent = 'country,sector,parent sector,1990\nUSA,Energy,,100.5';
    const mockFile = {
      buffer: Buffer.from(csvContent),
    } as Express.Multer.File;

    const expectedRawHeaders = ['country', 'sector', 'parent sector', '1990'];

    // Step 1: validateAndNormalize headers
    mockValidator.validateAndNormalize.mockReturnValue(expectedRawHeaders);

    // Step 2: extract rows using normalized headers
    mockParser.extractRows.mockReturnValue([
      {
        country: 'USA',
        sector: 'Energy',
        'parent sector': '',
        '1990': '100.5',
      },
    ]);

    // Step 3: deduplicate
    mockDeduplicator.deduplicate.mockReturnValue({
      rows: [
        {
          country: 'USA',
          sector: 'Energy',
          'parent sector': '',
          '1990': '100.5',
        },
      ],
      removed: 0,
    });

    // Step 4: map
    mockMapper.map.mockReturnValue({
      rows: [
        {
          countryCode: 'USA',
          sectorName: 'Energy',
          parentSectorName: null,
          year: 1990,
          value: 100.5,
        },
      ],
      summary: '1 valid row, 0 errors',
    });

    // Steps 5–6: Insert and aggregate
    mockCountryService.getOrCreateCountry.mockResolvedValue({
      id: 'country-id',
      code: 'USA',
    });
    mockSectorService.getOrCreateSector.mockResolvedValue({
      id: 'sector-id',
      name: 'Energy',
      parentSectorId: null,
    });
    mockEmissionService.getOrCreateEmissionRecord.mockResolvedValue({
      id: 'record-id',
      year: 1990,
      value: 100.5,
      countryId: 'country-id',
      sectorID: 'sector-id',
    });
    mockAggregator.getSummary.mockResolvedValue({
      totalRecords: 1,
      minYear: 1990,
      maxYear: 1990,
      minValue: 100.5,
      maxValue: 100.5,
    });

    const result = await service.import(mockFile);

    expect(mockValidator.validateAndNormalize).toHaveBeenCalledWith(
      expectedRawHeaders,
    );
    expect(mockParser.extractRows).toHaveBeenCalledWith(
      mockFile,
      expectedRawHeaders,
    );

    expect(result).toEqual({
      removed: 'No duplicates found.',
      summary: '1 valid row, 0 errors',
      aggregations: {
        totalRecords: 1,
        minYear: 1990,
        maxYear: 1990,
        minValue: 100.5,
        maxValue: 100.5,
      },
    });
  });
});
