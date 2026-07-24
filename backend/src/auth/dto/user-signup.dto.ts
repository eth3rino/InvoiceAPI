import { IsEmail, IsString } from "class-validator";

export class userSignupDto {
    @IsEmail()
    readonly email!: string;

    @IsString()
    readonly passwd!: string;

    @IsString()
    readonly displayName!: string;
}