import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateFichierDto {
    @ApiProperty({ description: 'fichier', type: 'string', format: 'binary' })
    file: any;

    @ApiProperty({ description: 'ID du type de rubrique' })
    @IsNotEmpty()
    @IsUUID()
    idTypeRubrique: string;
}
