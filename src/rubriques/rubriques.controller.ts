import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RubriquesService } from './rubriques.service';
import { CreateRubriqueDto } from './dto/create-rubrique.dto';
import { UpdateRubriqueDto } from './dto/update-rubrique.dto';
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('rubriques')
export class RubriquesController {
  constructor(private readonly rubriquesService: RubriquesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une rubrique' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Rubrique créée' })
  create(@Body() createRubriqueDto: CreateRubriqueDto) {
    return this.rubriquesService.create(createRubriqueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les rubriques' })
  @ApiResponse({ status: 200, description: 'Liste des rubriques' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  findAll(@Query('page') page: number, @Query('limit') limit: number,@Query('search') search: string) {
    return this.rubriquesService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une rubrique par ID' })
  @ApiResponse({ status: 200, description: 'Rubrique trouvée' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  findOne(@Param('id') id: string) {
    return this.rubriquesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une rubrique' })
  @ApiResponse({ status: 200, description: 'Rubrique mise à jour' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  update(@Param('id') id: string, @Body() updateRubriqueDto: UpdateRubriqueDto) {
    return this.rubriquesService.update(id, updateRubriqueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une rubrique' })
  @ApiResponse({ status: 200, description: 'Rubrique supprimée' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  remove(@Param('id') id: string) {
    return this.rubriquesService.remove(id);
  }
}
