import { Module } from '@nestjs/common';
import { EmissionsModule } from './emissions/emissions.module';

@Module({
  imports: [EmissionsModule],
})
export class AppModule {}
