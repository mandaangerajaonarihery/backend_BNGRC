import { TypeRubrique } from "src/type-rubrique/entities/type-rubrique.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Fichier {
    @PrimaryGeneratedColumn('uuid')
    idFichier: string;

    @Column()
    nomFichier: string;

    @Column()
    typeFichier: string;

    @Column()
    tailleFichier: number;

    @Column()
    cheminFichier: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateCreation: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    dateModification: Date;

    @ManyToOne(() => TypeRubrique, (typeRubrique) => typeRubrique.fichiers)
    typeRubrique: TypeRubrique;
}
