import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ForgotAuthDto } from './dto/forgot-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>
  ) { }

  private getBaseUrl(): string {
    const host = this.configService.get<string>('APP_HOST', 'http://localhost');
    const port = this.configService.get<string>('PORT', '3001');
    return `${host}:${port}`;
  }

  private formatUserResponse(utilisateur: Auth) {
    const baseUrl = this.getBaseUrl();

    // Si l'avatar est un chemin relatif (ex: storage/avatar/file.png), on le transforme en URL
    if (utilisateur.avatar && !utilisateur.avatar.startsWith('http')) {
      utilisateur.avatar = `${baseUrl}/${utilisateur.avatar.replace(/\\/g, '/')}`;
    }

    // On retire le mot de passe de la réponse pour la sécurité
    const { motDePasse, ...userWithoutPassword } = utilisateur;
    return userWithoutPassword;
  }

  async genererToken(auth: Auth) {
    const payload = {
      idUtilisateur: auth.idUtilisateur,
      pseudo: auth.pseudo,
      role: auth.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Sauvegarder les tokens dans la base de données
    await this.authRepository.update(auth.idUtilisateur, {
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
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
      throw new BadRequestException(error.message);
    }
  }

  async connexion(loginAuthDto: LoginAuthDto) {
    try {
      const utilisateur = await this.authRepository.findOne({ where: { email: loginAuthDto.email } });
      if (!utilisateur) {
        throw new BadRequestException('Email ou mot de passe incorrect');
      }

      if (utilisateur.statut !== 'ACTIF') {
        throw new BadRequestException('Votre compte est en attente de validation ou a été rejeté');
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
      const utilisateurs = await this.authRepository.find({order: {createdAt: 'DESC'}});
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
