import { PartialType } from '@nestjs/swagger';
import { CreateTypeRubriqueDto } from './create-type-rubrique.dto';

export class UpdateTypeRubriqueDto extends PartialType(CreateTypeRubriqueDto) {}
