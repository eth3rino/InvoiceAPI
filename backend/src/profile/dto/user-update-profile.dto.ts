import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, Matches } from "class-validator";
import { IsValidTimezone } from "../../validators/timezone.validator";

export class UserUpdateProfileDto {
    @IsString()
    @IsOptional()
    readonly displayName?: string;
    @IsString()
    @IsOptional()
    readonly companyName?: string;
    @IsString()
    @IsOptional()
    readonly contactEmail?: string;

    @IsString()
    @IsOptional()
    readonly logoUrl?: string;
    @IsString()
    @IsOptional()
    readonly brandColor?: string;
    @IsString()
    @IsOptional()
    readonly templateId?: string;

    @IsString()
    @IsOptional()
    @Transform(({value}) => value?.replace(/-/g, ''))
    @Matches(/^\d{11}$/, {message: 'CUIT must be exactly 11 digits',})
    readonly cuit?: string;

    @IsString()
    @IsOptional()
    readonly address?: string;
    @IsString()
    @IsOptional()
    readonly city?: string;
    @IsString()
    @IsOptional()
    readonly province?: string;
    @IsString()
    @IsOptional()
    readonly postalCode?: string;

    @IsString()
    @IsOptional()
    @IsIn(['ARS', 'USD'], {message: 'Default currency must be ARS or USD'})
    readonly defaultCurrency?: 'ARS' | 'USD';

    @IsString()
    @IsOptional()
    @IsValidTimezone()
    readonly timezone?: string;
}