import { TypeRubrique } from "src/type-rubrique/entities/type-rubrique.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({type: 'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp',default:()=>'CURRENT_TIMESTAMP',onUpdate:'CURRENT_TIMESTAMP'})
    updatedAt: Date;
}
