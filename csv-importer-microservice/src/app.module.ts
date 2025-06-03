import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { CountryModule } from './country/country.module';
import { SectorModule } from './sector/sector.module';

@Module({
  imports: [PrismaModule, CountryModule, SectorModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
