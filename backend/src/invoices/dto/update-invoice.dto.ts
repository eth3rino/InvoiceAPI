import { IsISO8601, IsOptional, IsString } from 'class-validator'

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  readonly client_name?: string;
 
  @IsOptional()
  @IsISO8601()
  readonly due_date?: string;
 
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
