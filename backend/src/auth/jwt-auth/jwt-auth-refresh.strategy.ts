import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPayload } from "../../types/user-payload.interface";

@Injectable()
export class refreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private config: ConfigService) {
        const secret: string | undefined = config.get<string>('JWT_REFRESH_SECRET');
        if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: { sub: string; email: string }): Promise<UserPayload> {
        return { id: payload.sub, email: payload.email };
    }
}
