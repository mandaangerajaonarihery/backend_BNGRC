import { TypeRubrique } from "src/type-rubrique/entities/type-rubrique.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('rubriques')
export class Rubrique {
    @PrimaryGeneratedColumn('uuid')
    idRubrique: string;

    @Column()
    libelle: string;

    @Column()
    description: string;

    @OneToMany(() => TypeRubrique, (typeRubrique) => typeRubrique.rubrique)
    typeRubriques: TypeRubrique[];
}
