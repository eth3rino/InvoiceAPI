import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { accessTokenStrategy } from './auth/jwt-auth/jwt-auth-access.strategy';
import { refreshTokenStrategy } from './auth/jwt-auth/jwt-auth-refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth/jwt-auth.guard';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    InvoicesModule, 
    AuthModule, 
    PrismaModule, 
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env']
    }),
    PassportModule,
    JwtModule.register({}),
    ProfileModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    accessTokenStrategy,
    refreshTokenStrategy,
    {provide: APP_GUARD, useClass: JwtAuthGuard}
  ],
})
export class AppModule {}
