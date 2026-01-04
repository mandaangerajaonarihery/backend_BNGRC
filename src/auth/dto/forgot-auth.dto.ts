import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class ForgotAuthDto {
    @ApiProperty({ description: 'Email', example: 'JohnDoe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Mot de passe', example: 'password123' })
    @IsString()
    @MinLength(6)
    motDePasse: string;

    @ApiProperty({ description: 'Confirmation du mot de passe', example: 'password123' })
    @IsString()
    @MinLength(6)
    confirmationMotDePasse: string;
}