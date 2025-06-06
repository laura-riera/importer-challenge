import { Module } from '@nestjs/common';
import { EmissionsController } from './emissions.controller';
import { EmissionsService } from './emissions.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EmissionsController],
  providers: [EmissionsService, PrismaService],
})
export class EmissionsModule {}
