import { Module } from '@nestjs/common';
import { RubriquesService } from './rubriques.service';
import { RubriquesController } from './rubriques.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rubrique } from './entities/rubrique.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rubrique])],
  controllers: [RubriquesController],
  providers: [RubriquesService],
})
export class RubriquesModule {}
