import { IsEmail, IsString } from "class-validator";

export class UserSignupDto {
    @IsEmail()
    readonly email!: string;

    @IsString()
    readonly passwd!: string;

    @IsString()
    readonly displayName!: string;
}