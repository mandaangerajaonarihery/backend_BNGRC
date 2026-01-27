import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth, statutUtilisateur } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotAuthDto } from './dto/forgot-auth.dto';
import { CloudinaryService } from '../fichier/cloudinary.service'; // 🚀 Vérifie ce chemin d'import

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        private readonly jwtService: JwtService,
        private readonly cloudinaryService: CloudinaryService, // 🚀 Injection pour Vercel
    ) { }

    // Nettoyage : On ne gère plus de fichiers locaux car Vercel les efface
    private async deleteAvatar(avatarUrl: string) {
        if (avatarUrl && avatarUrl.includes('cloudinary')) {
            // Optionnel : Logique de suppression Cloudinary via publicId
            console.log(`L'ancien avatar (${avatarUrl}) sera ignoré car stocké sur le Cloud.`);
        }
    }

    async genererToken(utilisateur: Auth) {
        const payload = { 
            idUtilisateur: utilisateur.idUtilisateur, 
            email: utilisateur.email, 
            role: utilisateur.role, 
            pseudo: utilisateur.pseudo 
        };
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

            if (confirmationMotDePasse && motDePasse !== confirmationMotDePasse) {
                throw new BadRequestException('Les mots de passe ne correspondent pas');
            }

            const existingUser = await this.authRepository.findOne({
                where: [{ email }, { pseudo }]
            });

            if (existingUser) {
                if (existingUser.email === email) throw new BadRequestException('Cet email est déjà utilisé');
                if (existingUser.pseudo === pseudo) throw new BadRequestException('Ce pseudo est déjà utilisé');
            }

            // 🚀 Etape cruciale : Upload vers Cloudinary au lieu de storage/
            const uploadResult = await this.cloudinaryService.uploadImage(avatar);

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(motDePasse, salt);

            const utilisateur = this.authRepository.create({
                ...createAuthDto,
                motDePasse: hashedPassword,
                avatar: uploadResult.secure_url, // 🚀 On stocke l'URL Cloudinary sécurisée
                statut: statutUtilisateur.ATTENTE // Par défaut en attente
            });

            const savedUser = await this.authRepository.save(utilisateur);

            return {
                message: 'Inscription reussie, veuillez attendre la validation de votre compte par un administrateur',
                status: 201,
                data: this.formatUserResponse(savedUser),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async connexion(loginAuthDto: LoginAuthDto) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { email: loginAuthDto.email } });
            if (!utilisateur) {
                throw new BadRequestException('Email ou mot de passe incorrect');
            }

            // Gestion des statuts
            if (utilisateur.statut === statutUtilisateur.REJETER) {
                throw new BadRequestException('Désolé, votre connexion a été refusée.');
            } else if (utilisateur.statut === statutUtilisateur.ATTENTE) {
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
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouve');
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
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouvé');
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
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouvé');
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
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouve');
            
            const { motDePasse, ...userData } = updateAuthDto;
            const updateData: any = { ...userData };

            if (motDePasse) {
                const salt = await bcrypt.genSalt();
                updateData.motDePasse = await bcrypt.hash(motDePasse, salt);
            }

            await this.authRepository.update(id, updateData);
            return {
                message: 'Utilisateur mis a jour',
                status: 200,
                data: await this.authRepository.findOne({ where: { idUtilisateur: id } }),
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateProfile(id: string, updateAuthDto: UpdateAuthDto, avatar?: Express.Multer.File) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouvé');

            const { motDePasse, ...userData } = updateAuthDto;
            const updateData: any = { ...userData };

            if (avatar) {
                // 🚀 Nouvel upload Cloudinary pour le profil
                const uploadResult = await this.cloudinaryService.uploadImage(avatar);
                updateData.avatar = uploadResult.secure_url;
            }

            if (motDePasse) {
                const salt = await bcrypt.genSalt();
                updateData.motDePasse = await bcrypt.hash(motDePasse, salt);
            }

            await this.authRepository.update(id, updateData);
            const updatedUser = await this.authRepository.findOne({ where: { idUtilisateur: id } });

            return {
                message: 'Profil mis à jour avec succès',
                status: 200,
                data: this.formatUserResponse(updatedUser!)
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async motDePasseOublie(forgotAuthDto: ForgotAuthDto) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { email: forgotAuthDto.email } });
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouve');
            if (utilisateur.statut !== statutUtilisateur.ACTIF) {
                throw new BadRequestException('Votre compte n\'est pas actif');
            }

            if (forgotAuthDto.motDePasse !== forgotAuthDto.confirmationMotDePasse) {
                throw new BadRequestException('Les mots de passe ne correspondent pas');
            }

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(forgotAuthDto.motDePasse, salt);
            
            await this.authRepository.update(utilisateur.idUtilisateur, { motDePasse: hashedPassword });
            
            return {
                message: 'Mot de passe mis a jour',
                status: 200
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async refreshToken(id: string) {
        try {
            const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
            if (!utilisateur || !utilisateur.refreshToken) {
                throw new BadRequestException('Session expirée');
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
            if (!utilisateur) throw new BadRequestException('Utilisateur non trouve');

            await this.authRepository.delete(id);
            return {
                message: 'Utilisateur supprime',
                status: 200
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}