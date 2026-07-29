import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto, LineItem } from './dto/create-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DateTime } from 'luxon'
import { Invoice } from '@prisma/client';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { ListInvoicesOptions } from './dto/list-invoices.options';
import { PdfService } from '../pdf/pdf.service';
import { InvoicePayload } from '../types/invoice-payload.interface';

@Injectable()
export class InvoicesService {
    constructor(private db: PrismaService, private pdf: PdfService) {}

    async createInvoice(userId: string, invoice: CreateInvoiceDto) {
        const user = await this.checkUserExists(userId)

        const issueDate = this.parseUserDate(invoice.issueDate, user.timezone)
        const dueDate = this.parseUserDate(invoice.dueDate, user.timezone)

        if (dueDate < issueDate) throw new BadRequestException('Due date cannot be before issue date.')

        const invoiceNumber = await this.generateInvoiceNumber(userId)
        const {subtotal, taxAmount, total} = await this.calculateTotals(invoice.lineItems)
        
        return await this.db.invoice.create({
            data: {
                userId,
                invoiceNumber,
                status: 'draft',

                issueDate,
                dueDate,

                clientName: invoice.clientName,
                clientEmail: invoice.clientEmail,
                clientCuit: invoice.clientCuit,
                clientAddress: invoice.clientAddress,

                currency: invoice.currency,
                subtotal,
                taxAmount,
                total,

                notes: invoice.notes,

                lineItems: {
                    create: invoice.lineItems.map((item, index) => ({
                        description: item.description,
                        quantity: item.quantity,
                        rate: item.rate,
                        subtotal: item.quantity * item.rate,
                        position: index,
                    })),
                },
            },
            include: {lineItems: true}
        })
    }

    async getAllInvoices(userId: string, options: ListInvoicesOptions) {
        const { 
            page = 1, 
            invoiceNumber, 
            status, 
            clientName, 
            dateFrom, 
            dateTo, 
            minTotal, 
            maxTotal, 
            currency,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;

        const PAGE_SIZE: number = 20;
        const skip = (page - 1) * PAGE_SIZE;

        const where = {
            id: userId,
            deleted: false,
            ...(invoiceNumber && {invoiceNumber}),
            ...(clientName && {clientName}),
            ...(currency && {currency}),
            ...(dateFrom || dateTo) && {
                issueDate: {
                    ...(dateFrom && {gte: new Date(dateFrom)}),
                    ...(dateTo && {lte: new Date(dateTo)})
                }
            },
            ...(minTotal !== undefined || maxTotal !== undefined) && {
            total: {
                ...(minTotal !== undefined && { gte: minTotal }),
                ...(maxTotal !== undefined && { lte: maxTotal }),
            },
        },
        }

        const validSortFields = ['createdAt', 'dueDate', 'total', 'invoiceNumber'];
        const safeSort = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const safeOrder = sortOrder == 'asc' ? 'asc' : 'desc';

        const count = await this.getInvoiceCount(userId, status)
        const invoices = await this.db.invoice.findMany({
            where,
            orderBy: {[safeSort]: safeOrder},
            take: 20,
            skip,
            include: {lineItems: true}
        })


        return {invoices, count};
    }

    async getInvoiceById(userId: string, invoiceId: string): Promise<Invoice> {
        const invoice = await this.db.invoice.findFirst({
            where: {id: invoiceId, userId, deleted: false},
            include: {lineItems: true}
        });

        // 404, not 403 — don't confirm to a requester whether this invoice
        // ID exists at all if it isn't theirs.
        if (!invoice) throw new NotFoundException('Invoice not found.');

        return invoice;
    }

    async getInvoicePdfById(userId: string, invoiceId: string) {
        const invoice = await this.db.invoice.findFirst({
            where: {id: invoiceId, userId, deleted: false},
            include: {
                lineItems: true,
                user: {
                    select: {
                        displayName: true,
                        companyName: true,
                        contactEmail: true,
                        cuit: true,
                        address: true,
                        city: true,
                        province: true,
                        postalCode: true,
                        logoUrl: true
                    }
                }
            }
        });
        if (!invoice) throw new NotFoundException('Invoice not found')

        const pdfBuffer = await this.pdf.generateInvoicePdf(userId, invoice)
        const invoiceNumber = invoice.invoiceNumber
        return {pdfBuffer, invoiceNumber};
    }

    // ======================================================
    //                  HAVE TO COMPLETE
    // ======================================================
    
    // async getInvoicePdfById(userId: string, invoiceId: string) {
    //     const invoicePdf = await this.db.invoicePdf.findFirst({
    //         where: {invoiceId, userId}
    //     });

    //     if (!invoicePdf) throw new NotFoundException('Invoice PDF not found.');

    //     return 
    // }


    async updateInvoiceData(userId: string, invoiceId: string, updateData: UpdateInvoiceDto) {
        const invoice = await this.getInvoiceById(userId, invoiceId);
        if (invoice.status !== 'draft') throw new BadRequestException('Can only edit draft invoices.')

        return this.db.invoice.update({
            where: {id: invoiceId},
            data: updateData
        })
        
    }

    async updateInvoiceStatus(userId: string, invoiceId: string, updateStatus: UpdateInvoiceStatusDto) {
        // TODO: 

        const invoice = await this.getInvoiceById(userId, invoiceId);
        const status = updateStatus.status

        const validTransitions: Record<string, string[]> = {
            draft: ['sent'],
            sent: ['paid', 'overdue'],
            paid: [],
            overdue: ['paid']
        }
        if (!validTransitions[invoice.status].includes(status)) throw new BadRequestException(`Cannot transition from ${invoice.status} to ${status}`)
        // Update invoice status

        return this.db.invoice.update({
            where: {id: invoiceId},
            data: updateStatus
        });
    }

    async deleteInvoice(userId: string, invoiceId: string) {
        // TODO:
        await this.getInvoiceById(userId, invoiceId)
        
        return await this.db.invoice.update({
            where: {id: invoiceId},
            data: {
                deleted: true,
                deletedAt: new Date()
            }
        })
    }





    // =================================
    //        UTILITY FUNCTIONS
    // =================================

    async generateInvoicePdf() {
        // TODO: 
        // Find invoice matching id + userId

        // Throw if invoice is undefined

        // Generate PDF with Puppeteer

        // Return PDF file

    }

    async generateInvoiceNumber(userId: string): Promise<string> {
        const year = new Date().getFullYear();
        const lastInvoice = await this.db.invoice.findFirst({
            where: {userId},
            orderBy: {createdAt: 'desc'}
        });
        let nextInvoiceNumber = 1; // then generate next number

        if (lastInvoice?.invoiceNumber.startsWith(`INV-${year}`)) {
            nextInvoiceNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10) + 1
        }

        return `INV-${year}-${String(nextInvoiceNumber).padStart(4, '0')}`; // Return nextInvoiceNumber
    }

    async calculateTotals(lineItems: LineItem[]) {
        const subtotal = lineItems.reduce((sum, item) => {
            return sum + (item.quantity * item.rate)
        }, 0);

        const taxAmount = Math.round(subtotal * .21 * 100) / 100;
        const total = subtotal + taxAmount;

        return { subtotal, taxAmount, total };
    }
    
    async checkUserExists(userId) {
        const user = await this.db.user.findUnique({where: {id: userId}});

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    private parseUserDate(dateString: string, timezone: string): Date {
        const dt = DateTime.fromISO(dateString, { zone: timezone });
        if (!dt.isValid) throw new BadRequestException(`Invalid date: ${dateString}`);
        return dt.toJSDate();
    }

    private async getInvoiceCount(userId: string, status?: string) {
        return await this.db.invoice.count({
            where: {
                userId,
                ...(status && {status})
            }
        })
    }
}
