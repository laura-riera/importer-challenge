export class CsvRowDto {
  countryCode: string;
  sectorName: string;
  parentSectorName?: string | null;
  year: number;
  value: number | null;
}
