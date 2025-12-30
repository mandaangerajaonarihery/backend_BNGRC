import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateTypeRubriqueDto {
    @ApiProperty({
        description: 'Nom du type de rubrique', example: 'Type de rubrique'
    })
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    nomTypeRubrique: string;

    @ApiProperty({
        description: 'ID de la rubrique', example: 'uuid'
    })
    @IsUUID()
    idRubrique: string;
}
