import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

export class CreateFichierDto {
    @ApiProperty({ description: 'fichier', type: 'string', format: 'binary' })
    file: any;

    @ApiProperty({ description: 'ID du type de rubrique' })
    @IsNotEmpty()
    @IsUUID()
    idTypeRubrique: string;

    @ApiProperty({ description: 'Privée ou publique' })
    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    privee: boolean;
}
