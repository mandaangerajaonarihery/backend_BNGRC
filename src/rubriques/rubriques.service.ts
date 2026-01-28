import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRubriqueDto } from './dto/create-rubrique.dto';
import { UpdateRubriqueDto } from './dto/update-rubrique.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rubrique } from './entities/rubrique.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class RubriquesService {
  constructor(
    @InjectRepository(Rubrique)
    private readonly rubriquesRepository: Repository<Rubrique>,
  ) { }
  async create(createRubriqueDto: CreateRubriqueDto) {
    try {
      let rubrique = await this.rubriquesRepository.findOne({ where: { libelle: createRubriqueDto.libelle } })
      if (rubrique) {
        throw new BadRequestException('Rubrique existe déjà');
      }
      rubrique = this.rubriquesRepository.create(createRubriqueDto);
      const rubriqueSaved = await this.rubriquesRepository.save(rubrique);

      return {
        message: 'Rubrique créée avec succès',
        rubrique: rubriqueSaved,
        status: 201,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(page = 1, limit = 10, search?: string) {
    try {
      const query = this.rubriquesRepository
        .createQueryBuilder('rubrique')
        .leftJoinAndSelect('rubrique.typeRubriques', 'typeRubrique')
        .leftJoinAndSelect(
          'typeRubrique.fichiers',
          'fichier',
          'fichier.privee = false AND fichier.estValide = true',
        )
        .skip((page - 1) * limit)
        .take(limit);

      if (search?.trim()) {
        query.andWhere(
          'LOWER(rubrique.libelle) LIKE LOWER(:search)',
          { search: `%${search.trim()}%` },
        );
      }

      query.orderBy('fichier.dateCreation', 'ASC');

      const [data, total] = await query.getManyAndCount();

      return {
        message: 'Liste des rubriques',
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


  async findAllMembre(page = 1, limit = 10, search?: string) {
    try {
      const query = this.rubriquesRepository
        .createQueryBuilder('rubrique')
        .leftJoinAndSelect('rubrique.typeRubriques', 'typeRubrique')
        .leftJoinAndSelect(
          'typeRubrique.fichiers',
          'fichier',
          'fichier.estValide = true',
        )
        .skip((page - 1) * limit)
        .take(limit);

      if (search?.trim()) {
        query.andWhere(
          'LOWER(rubrique.libelle) LIKE LOWER(:search)',
          { search: `%${search.trim()}%` },
        );
      }

      query.orderBy('fichier.dateCreation', 'ASC');

      const [data, total] = await query.getManyAndCount();

      return {
        message: 'Liste des rubriques',
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
      const rubrique = await this.rubriquesRepository.findOne({ where: { idRubrique: id } })
      if (!rubrique) {
        throw new BadRequestException('Rubrique non trouvée');
      }
      return {
        message: 'Rubrique trouvée',
        rubrique,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateRubriqueDto: UpdateRubriqueDto) {
    try {
      let rubrique = await this.rubriquesRepository.findOne({ where: { idRubrique: id } })
      if (!rubrique) {
        throw new BadRequestException('Rubrique non trouvée');
      }

      Object.assign(rubrique, updateRubriqueDto);

      const rubriqueSaved = await this.rubriquesRepository.save(rubrique);
      return {
        message: 'Rubrique mise à jour avec succès',
        rubrique: rubriqueSaved,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const rubrique = await this.rubriquesRepository.findOne({ where: { idRubrique: id } })
      if (!rubrique) {
        throw new BadRequestException('Rubrique non trouvée');
      }
      await this.rubriquesRepository.remove(rubrique);
      return {
        message: 'Rubrique supprimée avec succès',
        rubrique,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
