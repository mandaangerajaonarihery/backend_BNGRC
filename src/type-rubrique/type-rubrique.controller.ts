import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TypeRubriqueService } from './type-rubrique.service';
import { CreateTypeRubriqueDto } from './dto/create-type-rubrique.dto';
import { UpdateTypeRubriqueDto } from './dto/update-type-rubrique.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/auth.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Type Rubrique')
@Controller('type-rubrique')
@ApiBearerAuth()
export class TypeRubriqueController {
  constructor(private readonly typeRubriqueService: TypeRubriqueService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un type de rubrique' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Type de rubrique créé' })
  create(@Body() createTypeRubriqueDto: CreateTypeRubriqueDto) {
    return this.typeRubriqueService.create(createTypeRubriqueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les types de rubriques' })
  @ApiResponse({ status: 200, description: 'Liste des types de rubriques' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'idRubrique', type: 'string', required: true })
  @ApiQuery({ name: 'date', type: 'string', required: false })
  findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string, @Query('idRubrique') idRubrique: string, @Query('date') date: string) {
    return this.typeRubriqueService.findAll(page, limit, search, idRubrique, date);
  }

  @Get('/edit/:id')
  @ApiOperation({ summary: 'Obtenir un type de rubrique par ID' })
  @ApiResponse({ status: 200, description: 'Type de rubrique trouvée' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findOne(@Param('id') id: string) {
    return this.typeRubriqueService.findOne(id);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Editer un type de rubrique par ID' })
  @ApiResponse({ status: 200, description: 'Type de rubrique trouvée' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  editer(@Param('id') id: string) {
    return this.typeRubriqueService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un type de rubrique' })
  @ApiResponse({ status: 200, description: 'Type de rubrique mise à jour' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateTypeRubriqueDto: UpdateTypeRubriqueDto) {
    return this.typeRubriqueService.update(id, updateTypeRubriqueDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un type de rubrique' })
  @ApiResponse({ status: 200, description: 'Type de rubrique supprimée' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  remove(@Param('id') id: string) {
    return this.typeRubriqueService.remove(id);
  }
}
