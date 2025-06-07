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

    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  it('should return existing emission record and write to log if found', async () => {
    const existing = {
      id: '1',
      year: 2000,
      value: 10,
      countryId: 'country-1',
      sectorID: 'sector-1',
      sector: { name: 'Energy' },
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
      include: {
        sector: true,
      },
    });

    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  it('should create new record if existing record has sector name "Other"', async () => {
    const existingWithOtherSector = {
      id: 'existing-id',
      year: 2005,
      value: 15,
      countryId: 'country-3',
      sectorID: 'sector-3',
      sector: { name: 'Other' },
    };

    const created: EmissionRecord = {
      id: '3',
      year: 2005,
      value: 20,
      countryId: 'country-3',
      sectorID: 'sector-3',
    };

    mockFindFirst.mockResolvedValueOnce(existingWithOtherSector);
    mockCreate.mockResolvedValueOnce(created);

    const result = await service.getOrCreateEmissionRecord(
      'country-3',
      'sector-3',
      2005,
      20,
    );

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        countryId: 'country-3',
        sectorID: 'sector-3',
        year: 2005,
      },
      include: {
        sector: true,
      },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        countryId: 'country-3',
        sectorID: 'sector-3',
        year: 2005,
        value: 20,
      },
    });

    expect(fs.appendFileSync).not.toHaveBeenCalled();
    expect(result).toEqual(created);
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

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        countryId: 'country-2',
        sectorID: 'sector-2',
        year: 2001,
      },
      include: {
        sector: true,
      },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        countryId: 'country-2',
        sectorID: 'sector-2',
        year: 2001,
        value: 25,
      },
    });

    expect(fs.appendFileSync).not.toHaveBeenCalled();
    expect(result).toEqual(created);
  });
});
