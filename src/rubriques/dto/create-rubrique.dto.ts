import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateRubriqueDto {
    @ApiProperty({
        description: "Nom de la rubrique",
        example: "Rubrique 1"
    })
    @IsString()
    @MinLength(3)
    libelle: string;

    @ApiProperty({
        description: "Description de la rubrique",
        example: "Description de la rubrique"
    })
    @MaxLength(100)
    @IsString()
    description: string;
}
