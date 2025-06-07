import { Test, TestingModule } from '@nestjs/testing';
import { EmissionsService } from './emissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryEmissionsDto } from './dto/query-emissions.dto';

describe('EmissionsService', () => {
  let service: EmissionsService;

  const prismaMock = {
    emissionRecord: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<EmissionsService>(EmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return filtered and paginated emissions', async () => {
    const query: QueryEmissionsDto = {
      page: 1,
      pageSize: 10,
      country: 'USA',
      sector: 'Energy',
      year: 2020,
      minValue: 0,
      maxValue: 1000,
      sort: 'year:desc',
    };

    const fakeResults = [
      {
        id: '1',
        year: 2020,
        value: 500,
        country: { code: 'USA' },
        sector: { name: 'Energy' },
      },
    ];

    prismaMock.emissionRecord.findMany.mockResolvedValue(fakeResults);
    prismaMock.emissionRecord.count.mockResolvedValue(25);

    const result = await service.getEmissions(query);

    expect(prismaMock.emissionRecord.findMany).toHaveBeenCalled();
    expect(prismaMock.emissionRecord.count).toHaveBeenCalled();
    expect(result.data).toEqual(fakeResults);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });
  });
});
