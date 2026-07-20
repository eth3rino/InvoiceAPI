import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { PdfService } from './pdf/pdf.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [InvoicesModule, AuthModule, DatabaseModule],
  controllers: [AppController, AuthController, InvoicesController],
  providers: [AppService, InvoicesService, PdfService],
})
export class AppModule {}
