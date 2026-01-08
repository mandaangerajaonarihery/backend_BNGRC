import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 🚀 1. Méthode classique (Headers)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                
                // 🚀 2. Nouvelle méthode : chercher "token" dans l'URL (?token=...)
                // C'est indispensable pour que les iframes et images protégées s'affichent
                ExtractJwt.fromUrlQueryParameter('token'),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'defaultSecret',
        });
    }

    async validate(payload: any) {
        return { 
            idUtilisateur: payload.idUtilisateur, 
            pseudo: payload.pseudo, 
            role: payload.role 
        };
    }
}