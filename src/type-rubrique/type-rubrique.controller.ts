import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TypeRubriqueService } from './type-rubrique.service';
import { CreateTypeRubriqueDto } from './dto/create-type-rubrique.dto';
import { UpdateTypeRubriqueDto } from './dto/update-type-rubrique.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/auth.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Type Rubrique')
@Controller('type-rubrique')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TypeRubriqueController {
  constructor(private readonly typeRubriqueService: TypeRubriqueService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un type de rubrique' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Type de rubrique créé' })
  create(@Body() createTypeRubriqueDto: CreateTypeRubriqueDto) {
    return this.typeRubriqueService.create(createTypeRubriqueDto);
  }

  @Get('/:idRubrique')
  @ApiOperation({ summary: 'Lister les types de rubriques' })
  @ApiResponse({ status: 200, description: 'Liste des types de rubriques' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string, @Param('idRubrique') idRubrique: string) {
    return this.typeRubriqueService.findAll(page, limit, search, idRubrique);
  }

  @Get('/edit/:id')
  @ApiOperation({ summary: 'Obtenir un type de rubrique par ID' })
  @ApiResponse({ status: 200, description: 'Type de rubrique trouvée' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findOne(@Param('id') id: string) {
    return this.typeRubriqueService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un type de rubrique' })
  @ApiResponse({ status: 200, description: 'Type de rubrique mise à jour' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateTypeRubriqueDto: UpdateTypeRubriqueDto) {
    return this.typeRubriqueService.update(id, updateTypeRubriqueDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un type de rubrique' })
  @ApiResponse({ status: 200, description: 'Type de rubrique supprimée' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.typeRubriqueService.remove(id);
  }
}
