import { CountryService } from './country.service';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '../../../generated/prisma';

describe('CountryService', () => {
  let service: CountryService;

  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();

  const mockPrismaService = {
    country: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CountryService(mockPrismaService);
  });

  it('should return existing country if found', async () => {
    const mockCountry: Country = { id: '1', code: 'USA' };
    mockFindUnique.mockResolvedValue(mockCountry);

    const result = await service.getOrCreateCountry('USA');

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { code: 'USA' } });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result).toBe(mockCountry);
  });

  it('should create country if not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const createdCountry: Country = { id: '2', code: 'FRA' };
    mockCreate.mockResolvedValue(createdCountry);

    const result = await service.getOrCreateCountry('FRA');

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { code: 'FRA' } });
    expect(mockCreate).toHaveBeenCalledWith({ data: { code: 'FRA' } });
    expect(result).toBe(createdCountry);
  });
});
