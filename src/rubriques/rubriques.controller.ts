import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RubriquesService } from './rubriques.service';
import { CreateRubriqueDto } from './dto/create-rubrique.dto';
import { UpdateRubriqueDto } from './dto/update-rubrique.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/auth.entity';

@ApiTags('Rubriques')
@ApiBearerAuth()
@Controller('rubriques')
export class RubriquesController {
  constructor(private readonly rubriquesService: RubriquesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @ApiQuery({name: 'page', required: false, type: Number})
  @ApiQuery({name: 'limit', required: false, type: Number})
  @ApiQuery({name: 'search', required: false, type: String})
  findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
    return this.rubriquesService.findAll(page, limit, search);
  }

  @Get('membre')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiOperation({ summary: 'Lister les rubriques' })
  @ApiResponse({ status: 200, description: 'Liste des rubriques' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiQuery({name: 'page', required: false, type: Number})
  @ApiQuery({name: 'limit', required: false, type: Number})
  @ApiQuery({name: 'search', required: false, type: String})
  findAllMembre(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
    return this.rubriquesService.findAllMembre(page, limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtenir une rubrique par ID' })
  @ApiResponse({ status: 200, description: 'Rubrique trouvée' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  findOne(@Param('id') id: string) {
    return this.rubriquesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour une rubrique' })
  @ApiResponse({ status: 200, description: 'Rubrique mise à jour' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  update(@Param('id') id: string, @Body() updateRubriqueDto: UpdateRubriqueDto) {
    return this.rubriquesService.update(id, updateRubriqueDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une rubrique' })
  @ApiResponse({ status: 200, description: 'Rubrique supprimée' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  remove(@Param('id') id: string) {
    return this.rubriquesService.remove(id);
  }
}
