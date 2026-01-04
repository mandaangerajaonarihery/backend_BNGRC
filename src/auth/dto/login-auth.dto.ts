import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginAuthDto {
    @ApiProperty({ description: 'Email', example: 'JohnDoe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Mot de passe', example: 'password123' })
    @IsString()
    @MinLength(6)
    motDePasse: string;
}
