import { Injectable, NotFoundException,  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        private db: PrismaService,
    ) {}
    
    async getUserProfile(userId: string) {
        const user = await this.db.user.findUnique({where: {id: userId}})
        if (!user) throw new NotFoundException('User not found');

        const { passwordHash, ...safeUser} = user
        return safeUser;
    }

    async updateUser(userId: string, updateData: UserUpdateProfileDto) {
        try {
            const user = await this.db.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    companyName: true,
                    cuit: true,
                    address: true,
                    city: true,
                    province: true,
                    postalCode: true,
                    defaultCurrency: true,
                    timezone: true,
                },
            });
            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException('User not found');
            }
            throw error;
        }
    }
}
