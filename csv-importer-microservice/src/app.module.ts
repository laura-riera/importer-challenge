import { Module } from '@nestjs/common';
import { PrismaService } from './access/prisma/prisma.service';
import { ImporterModule } from './importer/importer.module';

@Module({
  imports: [ImporterModule],
  providers: [PrismaService],
})
export class AppModule {}
