import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotAuthDto } from './dto/forgot-auth.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        private readonly jwtService: JwtService,
    ) { }

    private async deleteAvatar(avatarPath: string) {
        if (avatarPath) {
            try {
                const fullPath = path.isAbsolute(avatarPath) ? avatarPath : path.join(process.cwd(), avatarPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (error) {
                console.error(`Erreur lors de la suppression de l'avatar : ${error.message}`);
            }
        }
    }

    async genererToken(utilisateur: Auth) {
        const payload = { idUtilisateur: utilisateur.idUtilisateur, email: utilisateur.email, role: utilisateur.role, pseudo: utilisateur.pseudo };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }

    formatUserResponse(user: Auth) {
        const { motDePasse, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async inscription(createAuthDto: CreateAuthDto, avatar: Express.Multer.File) {
        try {
            if (!avatar) {
                throw new BadRequestException('Veuillez ajouter une image d\'avatar');
            }

            const { motDePasse, confirmationMotDePasse, email, pseudo } = createAuthDto;

            createAuthDto.avatar = avatar.path;

            if (confirmationMotDePasse && motDePasse !== confirmationMotDePasse) {
                throw new BadRequestException('Les mots de passe ne correspondent pas');
            }

            const existingUser = await this.authRepository.findOne({
                where: [{ email }, { pseudo }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    throw new BadRequestException('Cet email est déjà utilisé');
                }
                if (existingUser.pseudo === pseudo) {
                    throw new BadRequestException('Ce pseudo est déjà utilisé');
                }
            }

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(motDePasse, salt);

            const utilisateur = this.authRepository.create({
                ...createAuthDto,
                motDePasse: hashedPassword,
            });

            const savedUser = await this.authRepository.save(utilisateur);

            return {
                message: 'Inscription reussie, veuillez attendre la validation de votre compte par un administrateur',
                status: 201,
                data: this.formatUserResponse(savedUser),
            }
        } catch (error) {
            if (avatar && avatar.path) {
                await this.deleteAvatar(avatar.path);
            }
            throw new BadRequestException(error.message);
        }
    }

    async connexion(loginAuthDto: LoginAuthDto) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { email: loginAuthDto.email } });
            if (!utilisateur) {
                throw new BadRequestException('Email ou mot de passe incorrect');
            }

            if (utilisateur.statut !== 'ACTIF' && utilisateur.statut !== 'ATTENTE') {
                throw new BadRequestException('Désolé, votre de connexion a été refusée. Veuillez contacter l\'administrateur pour plus d\'informations.');
            } else if (utilisateur.statut === 'ATTENTE') {
                throw new BadRequestException('Votre compte est en attente de validation par un administrateur.');
            }


            const isMatch = await bcrypt.compare(loginAuthDto.motDePasse, utilisateur.motDePasse);
            if (!isMatch) {
                throw new BadRequestException('Email ou mot de passe incorrect');
            }

            const tokens = await this.genererToken(utilisateur);
            utilisateur.accessToken = tokens.accessToken;
            utilisateur.refreshToken = tokens.refreshToken;
            await this.authRepository.save(utilisateur);

            return {
                message: 'Connexion reussie',
                status: 200,
                data: {
                    utilisateur: this.formatUserResponse(utilisateur),
                    ...tokens,
                },
            }

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async findAll() {
        try {
            const utilisateurs = await this.authRepository.find({ order: { createdAt: 'DESC' } });
            return {
                message: 'Liste des utilisateurs',
                status: 200,
                data: utilisateurs.map(u => this.formatUserResponse(u)),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async findOne(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouve');
            }
            return {
                message: 'Utilisateur trouve',
                status: 200,
                data: this.formatUserResponse(utilisateur),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async currentUser(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouvé');
            }
            return {
                message: 'Utilisateur trouvé',
                status: 200,
                data: this.formatUserResponse(utilisateur),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async logout(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouvé');
            }
            utilisateur.accessToken = null;
            utilisateur.refreshToken = null;
            await this.authRepository.save(utilisateur);
            return {
                message: 'Utilisateur deconnecte',
                status: 200,
                data: this.formatUserResponse(utilisateur),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async update(id: string, updateAuthDto: UpdateAuthDto) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouve');
            }
            const { motDePasse, ...userData } = updateAuthDto;
            const updateData = { ...userData };

            if (motDePasse) {
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(motDePasse, salt);
                (updateData as any).motDePasse = hashedPassword;
            }

            const utilisateurUpdated = await this.authRepository.update(id, updateData);
            return {
                message: 'Utilisateur mis a jour',
                status: 200,
                data: utilisateurUpdated,
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateProfile(id: string, updateAuthDto: UpdateAuthDto, avatar?: Express.Multer.File) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouvé');
            }

            const { motDePasse, ...userData } = updateAuthDto;
            const updateData: any = { ...userData };

            if (avatar) {
                if (utilisateur.avatar) {
                    await this.deleteAvatar(utilisateur.avatar);
                }
                updateData.avatar = avatar.path;
            }

            if (motDePasse) {
                const salt = await bcrypt.genSalt();
                updateData.motDePasse = await bcrypt.hash(motDePasse, salt);
            }

            // Ensure pseudo/email uniqueness if changed (simplified check)
            if (updateData.pseudo && updateData.pseudo !== utilisateur.pseudo) {
                const existing = await this.authRepository.findOne({ where: { pseudo: updateData.pseudo } });
                if (existing) throw new BadRequestException('Ce pseudo est déjà utilisé');
            }

            await this.authRepository.update(id, updateData);

            // Return updated user
            const updatedUser = await this.authRepository.findOne({ where: { idUtilisateur: id } });

            if (!updatedUser) {
                throw new BadRequestException('Impossible de récupérer les informations de l\'utilisateur mis à jour');
            }

            return {
                message: 'Profil mis à jour avec succès',
                status: 200,
                data: this.formatUserResponse(updatedUser)
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async motDePasseOublie(forgotAuthDto: ForgotAuthDto) {
        try {
            console.log(forgotAuthDto.email);
            const utilisateur = await this.authRepository.findOne({ where: { email: forgotAuthDto.email } });
            console.log(utilisateur);
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouve');
            }
            if (utilisateur.statut !== 'ACTIF') {
                throw new BadRequestException('Votre compte est en attente de validation ou a été rejeté');
            }

            if (forgotAuthDto.motDePasse != forgotAuthDto.confirmationMotDePasse) {
                throw new BadRequestException('Les mots de passe ne correspondent pas');
            }

            const { motDePasse, confirmationMotDePasse, ...userData } = forgotAuthDto;
            const updateData = { ...userData };
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(forgotAuthDto.motDePasse, salt);
            (updateData as any).motDePasse = hashedPassword;
            const utilisateurUpdated = await this.authRepository.update(utilisateur.idUtilisateur, updateData);
            return {
                message: 'Mot de passe mis a jour',
                status: 200,
                data: utilisateurUpdated,
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async refreshToken(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            console.log(utilisateur);
            if (!utilisateur || !utilisateur.refreshToken) {
                throw new BadRequestException('Utilisateur non trouvé ou session expirée');
            }

            const tokens = await this.genererToken(utilisateur);

            utilisateur.accessToken = tokens.accessToken;
            utilisateur.refreshToken = tokens.refreshToken;
            await this.authRepository.save(utilisateur);

            return {
                message: 'Token rafraîchi',
                status: 200,
                data: {
                    utilisateur: this.formatUserResponse(utilisateur),
                    ...tokens,
                },
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async remove(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) {
                throw new BadRequestException('Utilisateur non trouve');
            }

            if (utilisateur.avatar) {
                await this.deleteAvatar(utilisateur.avatar);
            }

            const utilisateurDeleted = await this.authRepository.delete(id);
            return {
                message: 'Utilisateur supprime',
                status: 200,
                data: utilisateurDeleted,
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
