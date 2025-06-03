import { Injectable } from '@nestjs/common';
import { EmissionService } from '../../access/emission/emission.service';

@Injectable()
export class ImporterAggregatorService {
  constructor(private readonly emissionService: EmissionService) {}

  async getSummary() {
    const aggregations = await this.emissionService.getAggregations();

    return {
      totalRecords: aggregations._count,
      minYear: aggregations._min.year,
      maxYear: aggregations._max.year,
      minValue: aggregations._min.value,
      maxValue: aggregations._max.value,
    };
  }
}
