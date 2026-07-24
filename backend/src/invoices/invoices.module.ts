import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
    imports: [InvoicesController, PdfModule],
    providers: [InvoicesService],
    exports: []
})
export class InvoicesModule {}
