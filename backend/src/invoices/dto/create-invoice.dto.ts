import { IsArray, IsEmail, IsIn, IsISO8601, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateInvoiceDto {
  @IsString()
  readonly clientName!: string;
 
  @IsOptional()
  @IsEmail()
  readonly clientEmail?: string;
 
  @IsOptional()
  @IsString()
  readonly clientCuit?: string;
 
  @IsOptional()
  @IsString()
  readonly clientAddress?: string;
 
  @IsISO8601()
  readonly issueDate!: string; // ISO date string
 
  @IsISO8601()
  readonly dueDate!: string;
 
  @IsIn(['ARS', 'USD'])
  readonly currency!: string;
 
  @IsOptional()
  @IsString()
  readonly notes?: string;
 
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItem)
  readonly lineItems!: LineItem[];
}

export class LineItem {
    @IsString()
    readonly description!: string;

    @IsNumber()
    @Min(0.01)
    readonly quantity!: number;

    @IsNumber()
    @Min(0.01)
    readonly rate!: number;
}