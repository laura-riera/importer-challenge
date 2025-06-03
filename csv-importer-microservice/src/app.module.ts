import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './access/prisma/prisma.service';
import { ImporterModule } from './importer/importer.module';

@Module({
  imports: [ImporterModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
