import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { userSignupDto } from './dto/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import { userLoginDto } from './dto/user-login.dto';

import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
    constructor(
        private db: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async login(loginData: userLoginDto) {

        // Same exception to not leak which emails are registered
        const user = await this.db.user.findUnique({where: {email: loginData.email}});
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const passwordValid = this.comparePasswordHash(loginData.passwd, user.passwordHash);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.signTokens(user.id, user.email)
        return {...tokens, user: {id: user.id, email: user.email, displayName: user.displayName}}
    }

    async signup(signupData: userSignupDto) {
        const {email, passwd, displayName} = signupData
        this.checkIfUserExists(email)

        const passwordHash = await this.hashPassword(passwd);
        const user = await this.db.user.create({
            data: {email, passwordHash, displayName}
        })

        const tokens = await this.signTokens(user.id, user.email);

        return {...tokens, user: {id: user.id, email: user.email, displayName: user.displayName}};
    }

    async refreshAccessToken(id: string, email: string): Promise<TokenPair> {
        return await this.signTokens(id, email)
    }


    // ===================================
    //          UTILITY FUNCTIONS
    // ===================================

    private async hashPassword(password: string) {
        return await bcrypt.hash(password, 10)
    }

    private async comparePasswordHash(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }

    async checkIfUserExists(email: string) {
        const user = await this.db.user.findUnique({where: {email}}); 
        if (user) throw new ConflictException('Email already registered');
    }

    private async signTokens(userId: string, email: string):Promise<TokenPair> {
        const payload = {sub: userId, email};

        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m'
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET')
            })
        ])

        return {accessToken, refreshToken}
    }
}



export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}