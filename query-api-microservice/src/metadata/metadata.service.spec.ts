import { Test, TestingModule } from '@nestjs/testing';
import { MetadataService } from './metadata.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MetadataService', () => {
  let service: MetadataService;

  const prismaMock = {
    emissionRecord: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    country: {
      findMany: jest.fn(),
    },
    sector: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return status metadata correctly', async () => {
    prismaMock.emissionRecord.count.mockResolvedValue(100);
    prismaMock.emissionRecord.aggregate.mockResolvedValue({
      _min: { year: 1990 },
      _max: { year: 2020 },
    });
    prismaMock.country.findMany.mockResolvedValue([
      { code: 'ARG' },
      { code: 'USA' },
    ]);
    prismaMock.sector.findMany.mockResolvedValue([
      { name: 'Energy' },
      { name: 'Transport' },
    ]);

    const result = await service.getStatus();

    expect(prismaMock.emissionRecord.count).toHaveBeenCalled();
    expect(prismaMock.emissionRecord.aggregate).toHaveBeenCalled();
    expect(prismaMock.country.findMany).toHaveBeenCalled();
    expect(prismaMock.sector.findMany).toHaveBeenCalled();

    expect(result).toEqual({
      totalRecords: 100,
      minYear: 1990,
      maxYear: 2020,
      availableCountries: ['ARG', 'USA'],
      availableSectors: ['Energy', 'Transport'],
    });
  });
});
