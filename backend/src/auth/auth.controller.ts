import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RefreshTokenGuard } from './refresh-token/refresh-token.guard';
import type { UserPayload } from '../types/user-payload.interface';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('signup')
    async userSignup(@Body() signupData: UserSignupDto) {
        return await this.authService.signup(signupData);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async userLogin(@Body() loginData: UserLoginDto) {
        return await this.authService.login(loginData);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    async refreshAccessToken(@CurrentUser() user: UserPayload) {
        return await this.authService.refreshAccessToken(user.id, user.email);
    }
}
