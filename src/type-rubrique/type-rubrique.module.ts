import { Module } from '@nestjs/common';
import { TypeRubriqueService } from './type-rubrique.service';
import { TypeRubriqueController } from './type-rubrique.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeRubrique } from './entities/type-rubrique.entity';
import { Rubrique } from 'src/rubriques/entities/rubrique.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeRubrique,Rubrique])],
  controllers: [TypeRubriqueController],
  providers: [TypeRubriqueService],
})
export class TypeRubriqueModule {}
