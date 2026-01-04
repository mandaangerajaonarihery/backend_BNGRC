import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({unique: true})
    pseudo: string;

    @Column({unique: true})
    email: string;

    @Column()
    motDePasse: string;

    @Column({type: 'enum', enum: Role, default: Role.CLIENT})
    role: Role;

    @Column({type: 'enum', enum: statutUtilisateur, default: statutUtilisateur.ATTENTE})
    statut: statutUtilisateur;

    @CreateDateColumn({type: 'timestamp',default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp',default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @Column({nullable: true})
    refreshToken: string;

    @Column({nullable: true})
    avatar: string;

    @Column({nullable: true})
    accessToken: string;
}
