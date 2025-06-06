import { EmissionService } from './emission.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmissionRecord } from '../../../generated/prisma';
import * as fs from 'fs';

jest.mock('fs');

describe('EmissionService', () => {
  let service: EmissionService;

  const mockFindFirst = jest.fn();
  const mockCreate = jest.fn();

  const mockPrismaService = {
    emissionRecord: {
      findFirst: mockFindFirst,
      create: mockCreate,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmissionService(mockPrismaService);

    // Mock fs.appendFileSync para evitar efectos secundarios
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  it('should return existing emission record and write to log if found', async () => {
    const existing: EmissionRecord = {
      id: '1',
      year: 2000,
      value: 10,
      countryId: 'country-1',
      sectorID: 'sector-1',
    };

    mockFindFirst.mockResolvedValueOnce(existing);

    const result = await service.getOrCreateEmissionRecord(
      'country-1',
      'sector-1',
      2000,
      10,
    );

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        countryId: 'country-1',
        sectorID: 'sector-1',
        year: 2000,
      },
    });

    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(result).toBe(existing);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should create new emission record if not found', async () => {
    const created: EmissionRecord = {
      id: '2',
      year: 2001,
      value: 25,
      countryId: 'country-2',
      sectorID: 'sector-2',
    };

    mockFindFirst.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(created);

    const result = await service.getOrCreateEmissionRecord(
      'country-2',
      'sector-2',
      2001,
      25,
    );

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        countryId: 'country-2',
        sectorID: 'sector-2',
        year: 2001,
        value: 25,
      },
    });

    expect(result).toEqual(created);
    expect(fs.appendFileSync).not.toHaveBeenCalled(); // because it wasn't skipped
  });
});
