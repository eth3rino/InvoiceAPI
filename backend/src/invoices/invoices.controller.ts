import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ListInvoicesOptions } from './dto/list-invoices.options';
import type { UserPayload } from '../types/user-payload.interface';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private invoicesService: InvoicesService
    ) {}

    @Post()
    async createInvoice(@CurrentUser() user: UserPayload, @Body() invoice: CreateInvoiceDto,) {
        return await this.invoicesService.createInvoice(user.id, invoice)
    }

    @Get()
    async getAllInvoices(@CurrentUser() user: UserPayload, @Query() options: ListInvoicesOptions) {
        return await this.invoicesService.getAllInvoices(user.id, options)
    }

    @Get(':id')
    async getInvoiceById(@CurrentUser() user: UserPayload, @Param('id') invoiceId: string,) {
        return await this.invoicesService.getInvoiceById(user.id, invoiceId);
    }

    @Get(':id/pdf')
    async getInvoicePdfById(@CurrentUser() user: UserPayload, @Param('id') invoiceId: string) {
        return await this.invoicesService.getInvoicePdfById(user.id, invoiceId);
    }

    @Patch(':id') 
    async updateInvoiceData(@CurrentUser() user: UserPayload, @Param('id') invoiceId: string, @Body() updateData: UpdateInvoiceDto) {
        return await this.invoicesService.updateInvoiceData(user.id, invoiceId, updateData)
    }

    @Patch(':id') 
    async updateInvoiceStatus(@CurrentUser() user: UserPayload, @Param('id') invoiceId: string, @Body() updateStatus: UpdateInvoiceStatusDto) {
        return await this.invoicesService.updateInvoiceStatus(user.id, invoiceId, updateStatus)
    }

    @Delete(':id') 
    async deleteInvoice(@CurrentUser() user: UserPayload, @Param('id') invoiceId: string) {
        return await this.invoicesService.deleteInvoice(user.id, invoiceId)
    }
}
