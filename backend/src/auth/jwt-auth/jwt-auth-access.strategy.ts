import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPayload } from "../../types/user-payload.interface";

@Injectable()
export class accessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private config: ConfigService) {
        const secret: string | undefined = config.get<string>('JWT_SECRET')
        if (!secret) throw new Error('JWT_SECRET is not defined in environment variables')
         
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    async validate(payload: {sub: string, email: string}): Promise<UserPayload> {
        return {id: payload.sub, email: payload.email};
    }
}