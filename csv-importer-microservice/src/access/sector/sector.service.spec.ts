import { SectorService } from './sector.service';
import { PrismaService } from '../prisma/prisma.service';
import { Sector } from '../../../generated/prisma';

describe('SectorService', () => {
  let service: SectorService;

  const mockFindFirst = jest.fn();
  const mockUpdate = jest.fn();
  const mockCreate = jest.fn();

  const mockPrismaService = {
    sector: {
      findFirst: mockFindFirst,
      update: mockUpdate,
      create: mockCreate,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SectorService(mockPrismaService);
  });

  it('should return existing sector if found without parent change', async () => {
    const existingSector: Sector = {
      id: '123',
      name: 'Energy',
      parentSectorId: null,
    };

    mockFindFirst.mockResolvedValueOnce(existingSector); // first call
    const result = await service.getOrCreateSector('Energy');

    expect(mockFindFirst).toHaveBeenCalledWith({ where: { name: 'Energy' } });
    expect(result).toBe(existingSector);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should create sector if not found', async () => {
    mockFindFirst.mockResolvedValueOnce(null); // no match

    const created: Sector = {
      id: '456',
      name: 'Waste',
      parentSectorId: null,
    };
    mockCreate.mockResolvedValueOnce(created);

    const result = await service.getOrCreateSector('Waste');

    expect(mockFindFirst).toHaveBeenCalledWith({ where: { name: 'Waste' } });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { name: 'Waste', parentSectorId: undefined },
    });
    expect(result).toEqual(created);
  });

  it('should create parent sector recursively if needed', async () => {
    // Paso 1: "Parent" no existe, se busca
    mockFindFirst.mockResolvedValueOnce(null); // llamada #1: buscar 'Parent'

    // Paso 2: se entra en recursión y se vuelve a buscar 'Parent'
    mockFindFirst.mockResolvedValueOnce(null); // llamada #2: buscar 'Parent' de nuevo en recursivo

    // Paso 3: se crea el sector 'Parent'
    mockCreate.mockResolvedValueOnce({
      id: 'parent-id',
      name: 'Parent',
      parentSectorId: null,
    });

    // Paso 4: ahora se busca 'Child'
    mockFindFirst.mockResolvedValueOnce(null); // llamada #3: buscar 'Child'

    // Paso 5: se crea 'Child' con el ID de su padre
    mockCreate.mockResolvedValueOnce({
      id: 'child-id',
      name: 'Child',
      parentSectorId: 'parent-id',
    });

    const result = await service.getOrCreateSector('Child', 'Parent');

    // ✅ Validaciones actualizadas

    expect(mockFindFirst).toHaveBeenNthCalledWith(1, {
      where: { name: 'Parent' },
    });

    expect(mockFindFirst).toHaveBeenNthCalledWith(2, {
      where: { name: 'Parent' },
    });

    expect(mockCreate).toHaveBeenNthCalledWith(1, {
      data: { name: 'Parent', parentSectorId: undefined },
    });

    expect(mockFindFirst).toHaveBeenNthCalledWith(3, {
      where: { name: 'Child' },
    });

    expect(mockCreate).toHaveBeenNthCalledWith(2, {
      data: { name: 'Child', parentSectorId: 'parent-id' },
    });

    expect(result).toEqual({
      id: 'child-id',
      name: 'Child',
      parentSectorId: 'parent-id',
    });
  });

  it('should search by name and parent if sector is "Other"', async () => {
    mockFindFirst.mockResolvedValueOnce({
      id: 'parent-id',
      name: 'Energy',
      parentSectorId: null,
    }); // parent found
    mockFindFirst.mockResolvedValueOnce(null); // no 'Other' with parent

    mockCreate.mockResolvedValueOnce({
      id: 'other-id',
      name: 'Other',
      parentSectorId: 'parent-id',
    });

    const result = await service.getOrCreateSector('Other', 'Energy');

    expect(mockFindFirst).toHaveBeenNthCalledWith(2, {
      where: { name: 'Other', parentSectorId: 'parent-id' },
    });

    expect(result.name).toBe('Other');
  });

  it('should update existing sector to assign missing parent', async () => {
    const parent: Sector = {
      id: 'parent-id',
      name: 'Energy',
      parentSectorId: null,
    };

    mockFindFirst.mockResolvedValueOnce(parent); // parent exists

    const existing: Sector = {
      id: 'child-id',
      name: 'Other',
      parentSectorId: null,
    };

    mockFindFirst.mockResolvedValueOnce(existing); // child found
    mockUpdate.mockResolvedValueOnce({
      ...existing,
      parentSectorId: parent.id,
    });

    const result = await service.getOrCreateSector('Other', 'Energy');

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'child-id' },
      data: { parentSectorId: 'parent-id' },
    });

    expect(result.parentSectorId).toBe('parent-id');
  });
});
