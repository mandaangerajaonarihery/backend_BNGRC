import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role, statutUtilisateur } from "../entities/auth.entity";

export class CreateAuthDto {
    @ApiProperty({ description: 'Pseudo', example: 'JohnDoe' })
    @IsString()
    @MinLength(3)
    pseudo: string;

    @ApiProperty({ description: 'Email', example: 'JohnDoe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Mot de passe', example: 'JohnDoe' })
    @IsString()
    @MinLength(6)
    motDePasse: string;

    @ApiProperty({ description: 'Confirmation mot de passe', example: 'JohnDoe' })
    @IsString()
    @IsOptional()
    @MinLength(6)
    confirmationMotDePasse: string;

    @ApiProperty({ description: 'Role', enum: Role, example: Role.CLIENT })
    @IsEnum(Role)
    @IsOptional()
    role: Role;

    @ApiProperty({ description: 'Statut', enum: statutUtilisateur, example: statutUtilisateur.ATTENTE })
    @IsEnum(statutUtilisateur)
    @IsOptional()
    statut: statutUtilisateur;

    @ApiProperty({ description: 'Image',format: 'binary',type: 'string'})
    avatar: any;
}
