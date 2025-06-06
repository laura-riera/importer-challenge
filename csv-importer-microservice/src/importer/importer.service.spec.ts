import { ImporterService } from './importer.service';

describe('ImporterService', () => {
  let service: ImporterService;

  const mockValidator = {
    validateAndNormalize: jest.fn(),
  };

  const mockParser = {
    parse: jest.fn(),
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
      mockCountryService as any,
      mockSectorService as any,
      mockEmissionService as any,
      mockAggregator as any,
    );
  });

  it('should import CSV and return summaries', async () => {
    const mockFile = {
      buffer: Buffer.from(
        'country,sector,parent sector,1990\nUSA,Energy,,100.5',
      ),
    } as Express.Multer.File;

    mockValidator.validateAndNormalize.mockReturnValue([
      'country',
      'sector',
      'parent sector',
      '1990',
    ]);

    mockParser.parse.mockReturnValue({
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

    expect(mockValidator.validateAndNormalize).toHaveBeenCalled();
    expect(mockParser.parse).toHaveBeenCalled();
    expect(mockCountryService.getOrCreateCountry).toHaveBeenCalledWith('USA');
    expect(mockSectorService.getOrCreateSector).toHaveBeenCalledWith(
      'Energy',
      undefined,
    );
    expect(mockEmissionService.getOrCreateEmissionRecord).toHaveBeenCalledWith(
      'country-id',
      'sector-id',
      1990,
      100.5,
    );
    expect(mockAggregator.getSummary).toHaveBeenCalled();

    expect(result).toEqual({
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

  it('should return all emissions from getAllEmissions', async () => {
    const mockData = [{ id: 'rec1' }];
    mockEmissionService.findAll.mockResolvedValue(mockData);

    const result = await service.getAllEmissions();

    expect(mockEmissionService.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
});
