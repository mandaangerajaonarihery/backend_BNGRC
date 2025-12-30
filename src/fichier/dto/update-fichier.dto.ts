import { PartialType } from '@nestjs/swagger';
import { CreateFichierDto } from './create-fichier.dto';

export class UpdateFichierDto extends PartialType(CreateFichierDto) {}
