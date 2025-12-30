import { Fichier } from "src/fichier/entities/fichier.entity";
import { Rubrique } from "src/rubriques/entities/rubrique.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('type-rubriques')
export class TypeRubrique {
    @PrimaryGeneratedColumn('uuid')
    idTypeRubrique: string;

    @Column()
    nomTypeRubrique: string;

    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})    
    dateCreation: Date;

    @UpdateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',onUpdate: 'CURRENT_TIMESTAMP'})    
    dateModification: Date;

    @ManyToOne(() => Rubrique, (rubrique) => rubrique.typeRubriques)
    rubrique: Rubrique;

    @OneToMany(() => Fichier, (fichier) => fichier.typeRubrique)
    fichiers: Fichier[];
}
