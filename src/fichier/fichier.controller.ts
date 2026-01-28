import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, StreamableFile, UseGuards, Query } from '@nestjs/common';
import { FichierService } from './fichier.service';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { UpdateFichierDto } from './dto/update-fichier.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auth, Role } from '../auth/entities/auth.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('Fichier')
@Controller('fichier')
@ApiBearerAuth()
export class FichierController {
  constructor(private readonly fichierService: FichierService) { }

  @Post()
  @ApiBody({
    type: CreateFichierDto
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Créer un fichier' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Fichier créé' })
  create(@Body() createFichierDto: CreateFichierDto,@GetUser() user: Auth, @UploadedFile() file: Express.Multer.File) {
    return this.fichierService.create(createFichierDto,user.idUtilisateur, file);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les fichiers' })
  @ApiResponse({ status: 200, description: 'Liste des fichiers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiQuery({ name: 'idTypeRubrique',type: 'string', required: true })
  @ApiQuery({ name: 'date',type: 'Date', required: false })
  @ApiQuery({name: 'statut',type: 'boolean', required: false})
  findAll(@Query('idTypeRubrique') idTypeRubrique: string, @Query('update') date: Date, statut: boolean) {
    return this.fichierService.findAllGlobal(idTypeRubrique,date,statut);
  }

  @Get("fichier-public")
  @ApiOperation({ summary: 'Lister tous les fichiers' })
  @ApiResponse({ status: 200, description: 'Liste des fichiers' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiQuery({ name: 'idTypeRubrique',type: 'string', required: true })
  findAllStatut(@Query('idTypeRubrique') idTypeRubrique: string) {
    return this.fichierService.findAllStatutPrivee(idTypeRubrique);
  }

  @Get('/:id/visualiser')
  @ApiOperation({ summary: 'editer un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier trouvé' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findOne(@Param('id') id: string) {
    return this.fichierService.findOne(id);
  }

  @Patch(':id/validation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Valider un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier validé' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  updateValidation(@Param('id') id: string) {
    return this.fichierService.updateValidation(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Supprimer un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier supprimé' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.fichierService.remove(id);
  }

  @Get(':id/telecharger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Télécharger un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier téléchargé avec succès' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConsumes('application/json')
  @ApiProduces('application/octet-stream')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { stream, typeFichier, nomFichier, tailleFichier } = await this.fichierService.download(id);

    res.set({
      'Content-Type': typeFichier,
      'Content-Disposition': `attachment; filename="${nomFichier}"`,
      'Content-Length': tailleFichier,
    });
    return new StreamableFile(stream);
  }
}
