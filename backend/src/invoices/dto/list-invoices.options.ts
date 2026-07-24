import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ListInvoicesOptions {
    @IsString()
    @IsOptional()
    readonly status?: 'draft' | 'sent' | 'paid' | 'overdue';

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    readonly page?: number;

    @IsString()
    @IsOptional()
    readonly invoiceNumber?: string;

    @IsString() 
    @IsOptional()
    readonly clientName?: string;

    @IsDateString()
    @IsOptional()
    readonly dateFrom?: string;  // ISO date: 2024-01-01

    @IsDateString()
    @IsOptional()
    readonly dateTo?: string;  // ISO date: 2024-01-01

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    readonly minTotal?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    readonly maxTotal?: number;

    @IsOptional()
    @IsString()
    readonly currency?: 'ARS' | 'USD';

    @IsOptional()
    @IsString()
    readonly sortBy?: 'createdAt' | 'dueDate' | 'total';

    @IsOptional()
    @IsString()
    readonly sortOrder?: 'asc' | 'desc';
}