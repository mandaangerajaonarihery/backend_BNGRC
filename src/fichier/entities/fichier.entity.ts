import { Auth } from "src/auth/entities/auth.entity";
import { TypeRubrique } from "src/type-rubrique/entities/type-rubrique.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({type:'boolean',default:false})
    estValide: boolean;

    @Column({type: 'boolean',default:false})
    privee: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateCreation: Date;

    @ManyToOne(() => Auth, (auth) => auth.fichiers)
    @JoinColumn({name: "idUtilisateur"})
    auth: Auth;

    @ManyToOne(() => TypeRubrique, (typeRubrique) => typeRubrique.fichiers)
    @JoinColumn({name: "idTypeRubrique"})
    typeRubrique: TypeRubrique;
}
