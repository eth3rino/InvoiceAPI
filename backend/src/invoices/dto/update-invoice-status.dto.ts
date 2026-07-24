import { IsIn } from 'class-validator'

export class UpdateInvoiceStatusDto {
    @IsIn(['draft', 'sent', 'overdue', 'paid'])
    readonly status!: string;
}