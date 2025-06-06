import { Module } from '@nestjs/common';
import { EmissionsModule } from './emissions/emissions.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
  imports: [EmissionsModule, MetadataModule],
})
export class AppModule {}
