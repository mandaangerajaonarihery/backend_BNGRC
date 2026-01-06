import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { Role } from './entities/auth.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotAuthDto } from './dto/forgot-auth.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiOperation({ summary: 'Inscription' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiBadRequestResponse({ description: 'Email ou mot de passe incorrect' })
    create(@Body() createAuthDto: CreateAuthDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.authService.inscription(createAuthDto, avatar);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Liste des utilisateurs' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la recuperation des utilisateurs' })
    findAll() {
        return this.authService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Recuperer l utilisateur connecte' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la recuperation de l utilisateur' })
    getMe(@GetUser() user: any) {
        return this.authService.currentUser(user.idUtilisateur);
    }

    @Get('/profile/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Editer un utilisateur' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la recuperation de l utilisateur' })
    findOne(@Param('id') id: string) {
        return this.authService.findOne(id);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiOperation({ summary: 'Mise a jour du profil utilisateur' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la mise a jour du profil' })
    updateProfile(@GetUser() user: any, @Body() updateAuthDto: UpdateAuthDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.authService.updateProfile(user.idUtilisateur, updateAuthDto, avatar);
    }

    @Post('connexion')
    @ApiOperation({ summary: 'Connexion' })
    @ApiBadRequestResponse({ description: 'Email ou mot de passe incorrect' })
    connexion(@Body() loginAuthDto: LoginAuthDto) {
        return this.authService.connexion(loginAuthDto);
    }

    @Post('deconnexion/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deconnexion' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la deconnexion' })
    deconnexion(@Param('id') id: string) {
        return this.authService.logout(id);
    }

    @Post('refresh-token/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh token' })
    @ApiBadRequestResponse({ description: 'Erreur lors du refresh token' })
    refreshToken(@Param('id') id: string) {
        return this.authService.refreshToken(id);
    }

    @Post('mot-de-passe-oublie')
    @ApiOperation({ summary: 'Mot de passe oublie' })
    @ApiBadRequestResponse({ description: 'Erreur lors du mot de passe oublie' })
    motDePasseOublie(@Body() forgotAuthDto: ForgotAuthDto) {
        return this.authService.motDePasseOublie(forgotAuthDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mise a jour d un utilisateur' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la mise a jour de l utilisateur' })
    update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
        return this.authService.update(id, updateAuthDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer un utilisateur' })
    @ApiBadRequestResponse({ description: 'Erreur lors de la suppression de l utilisateur' })
    remove(@Param('id') id: string) {
        return this.authService.remove(id);
    }
}
