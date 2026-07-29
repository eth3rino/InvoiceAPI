import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserSignupDto } from './dto/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import { UserLoginDto } from './dto/user-login.dto';

import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
    constructor(
        private db: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async login(loginData: UserLoginDto) {

        // Same exception to not leak which emails are registered
        const user = await this.db.user.findUnique({where: {email: loginData.email}});
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const passwordValid = this.comparePasswordHash(loginData.passwd, user.passwordHash);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.signTokens(user.id, user.email)
        return {...tokens, user: {id: user.id, email: user.email, displayName: user.displayName}}
    }

    async signup(signupData: UserSignupDto) {
        const {
            passwd, 
            email,
            displayName, 
            companyName, 
            contactEmail, 
            logoUrl, 
            brandColor, 
            templateId, 
            cuit, 
            address, 
            city, 
            province, 
            postalCode, 
            defaultCurrency, 
            timezone
        } = signupData


        this.checkIfUserExists(email)

        const passwordHash = await this.hashPassword(passwd);
        const signupPayload = {
            email: email,
            passwordHash,
            displayName: displayName,
            ...(companyName && {companyName}),
            ...(contactEmail && {contactEmail}),
            ...(logoUrl && {logoUrl}),
            ...(brandColor && {brandColor}),
            ...(templateId && {templateId}),
            ...(cuit && {cuit}),
            ...(address && {address}), 
            ...(city && {city}),
            ...(province && {province}),
            ...(postalCode && {postalCode}),
            ...(defaultCurrency && {defaultCurrency}),
            ...(timezone && {timezone}),
        }

        const user = await this.db.user.create({
            data: signupPayload
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