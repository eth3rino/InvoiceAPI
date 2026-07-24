import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { UserPayload } from '../types/user-payload.interface';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';

@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {};
    
    @Get()
    async getUserProfile(@CurrentUser() user: UserPayload) {
        return await this.profileService.getUserProfile(user.id);
    };

    @Patch() 
    async updateUserProfile(@CurrentUser() user: UserPayload, @Body() userUpdate: UserUpdateProfileDto) {
        return await this.profileService.updateUser(user.id, userUpdate);
    };
}
