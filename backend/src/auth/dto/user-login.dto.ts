import { IsEmail, IsString } from "class-validator";

export class userLoginDto {
    @IsEmail()
    readonly email!: string;

    @IsString()
    readonly passwd!: string;
}