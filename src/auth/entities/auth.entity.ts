import { Fichier } from "src/fichier/entities/fichier.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Role {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT',
}

export enum statutUtilisateur {
    ATTENTE = 'ATTENTE',
    ACTIF = 'ACTIF',
    REJETER = 'REJETER',
}

@Entity('utilisateur')
export class Auth {
    @PrimaryGeneratedColumn('uuid')
    idUtilisateur: string;

    @Column({ unique: true })
    pseudo: string;

    @Column({ unique: true })
    email: string;

    @Column()
    motDePasse: string;

    @Column({ type: 'enum', enum: Role, default: Role.CLIENT })
    role: Role;

    @Column({ type: 'enum', enum: statutUtilisateur, default: statutUtilisateur.ATTENTE })
    statut: statutUtilisateur;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
 
    @Column({ nullable: true })
    avatar: string;

    @OneToMany(() => Fichier, (fichier) => fichier.auth)
    fichiers: Fichier[];

    @Column({ type: 'text', nullable: true })
    refreshToken: string | null;

    @Column({ type: 'text', nullable: true })
    accessToken: string | null;

}
