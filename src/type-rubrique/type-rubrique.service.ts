import { Injectable } from '@nestjs/common';
import { CreateTypeRubriqueDto } from './dto/create-type-rubrique.dto';
import { UpdateTypeRubriqueDto } from './dto/update-type-rubrique.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRubrique } from './entities/type-rubrique.entity';
import { Like, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Rubrique } from 'src/rubriques/entities/rubrique.entity';

@Injectable()
export class TypeRubriqueService {
  constructor(
    @InjectRepository(TypeRubrique)
    private readonly typeRubriqueRepository: Repository<TypeRubrique>,
    @InjectRepository(Rubrique)
    private readonly rubriquesRepository: Repository<Rubrique>,
  ) { }
  async create(createTypeRubriqueDto: CreateTypeRubriqueDto) {
    try {
      // Vérifier si la rubrique existe
      const rubrique = await this.rubriquesRepository.findOne({
        where: { idRubrique: createTypeRubriqueDto.idRubrique }
      });

      if (!rubrique) {
        throw new BadRequestException('Rubrique non trouvée');
      }

      // Vérifier si un type de rubrique avec le même nom existe déjà pour cette rubrique
      const existingTypeRubrique = await this.typeRubriqueRepository.findOne({
        where: {
          nomTypeRubrique: createTypeRubriqueDto.nomTypeRubrique,
          rubrique: { idRubrique: createTypeRubriqueDto.idRubrique }
        }
      });

      if (existingTypeRubrique) {
        throw new BadRequestException('Un type de rubrique avec ce nom existe déjà pour cette rubrique');
      }

      // Créer le type de rubrique avec la relation rubrique
      const typeRubrique = this.typeRubriqueRepository.create({
        nomTypeRubrique: createTypeRubriqueDto.nomTypeRubrique,
        rubrique: rubrique, // Assigner l'objet rubrique complet, pas juste l'ID
      });

      const typeRubriqueSaved = await this.typeRubriqueRepository.save(typeRubrique);

      return {
        message: 'Type de rubrique créé avec succès',
        typeRubrique: typeRubriqueSaved,
        status: 201,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(page = 1, limit = 10, search?: string, idRubrique?: string,update?: Date) {
    try {
      const [data, total] = await this.typeRubriqueRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where: [
          { nomTypeRubrique: Like(`%${search}%`) },
          {dateCreation: update},
          {dateModification: update},
          {fichiers: {dateCreation: update}},
          { rubrique: { idRubrique: idRubrique } },
        ],
        relations: ['rubrique','fichiers'],
        order: { nomTypeRubrique: 'ASC' },
      });

      return {
        message: 'Liste des types de rubriques',
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const typeRubrique = await this.typeRubriqueRepository.findOne({ where: { idTypeRubrique: id }, relations: ['rubrique','fichiers'] })
      if (!typeRubrique) {
        throw new BadRequestException('Type de rubrique non trouvée');
      }
      return {
        message: 'Type de rubrique trouvée',
        typeRubrique,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateTypeRubriqueDto: UpdateTypeRubriqueDto) {
    try {
      let typeRubrique = await this.typeRubriqueRepository.findOne({ where: { idTypeRubrique: id } })
      if (!typeRubrique) {
        throw new BadRequestException('Type de rubrique non trouvée');
      }
      Object.assign(typeRubrique, updateTypeRubriqueDto);
      const typeRubriqueSaved = await this.typeRubriqueRepository.save(typeRubrique);
      return {
        message: 'Type de rubrique mise à jour avec succès',
        typeRubrique: typeRubriqueSaved,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const typeRubrique = await this.typeRubriqueRepository.findOne({ where: { idTypeRubrique: id } })
      if (!typeRubrique) {
        throw new BadRequestException('Type de rubrique non trouvée');
      }
      await this.typeRubriqueRepository.remove(typeRubrique);
      return {
        message: 'Type de rubrique supprimée avec succès',
        typeRubrique,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
