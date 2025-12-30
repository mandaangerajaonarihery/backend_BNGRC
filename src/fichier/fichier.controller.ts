import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, StreamableFile } from '@nestjs/common';
import { FichierService } from './fichier.service';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { UpdateFichierDto } from './dto/update-fichier.dto';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('fichier')
export class FichierController {
  constructor(private readonly fichierService: FichierService) { }

  @Post()
  @ApiBody({
    type: CreateFichierDto
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Créer un fichier' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Fichier créé' })
  create(@Body() createFichierDto: CreateFichierDto, @UploadedFile() file: Express.Multer.File) {
    return this.fichierService.create(createFichierDto, file);
  }

  @Get(':idTypeRubrique')
  @ApiOperation({ summary: 'Lister tous les fichiers' })
  @ApiResponse({ status: 200, description: 'Liste des fichiers' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findAll(@Param('idTypeRubrique') idTypeRubrique: string) {
    return this.fichierService.findAll(idTypeRubrique);
  }

  @Get('/:id/visualiser')
  @ApiOperation({ summary: 'Lister un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier trouvé' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findOne(@Param('id') id: string) {
    return this.fichierService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier supprimé' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.fichierService.remove(id);
  }

  @Get(':id/telecharger')
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
