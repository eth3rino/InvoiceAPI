import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer'
import * as handlebars from 'handlebars'
import * as fs from 'fs/promises'
import * as path from 'path'
import { InvoicePayload } from '../types/invoice-payload.interface';
import { getDefaultTemplate } from './templates/default.template';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicePdfDto } from './invoice-pdf.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);
    private browser: puppeteer.Browser | null = null;
    private generatingPdfs = new Set<string>();
    private pdfDir!: string;


    constructor(private db: PrismaService, private config: ConfigService) {
        this.initBrowser()
        this.pdfDir = config.get<string>('PDF_STORAGE_DIR') || './tmp/pdfs';
    }

    private async initBrowser() {
        try {
            this.browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-gpu',
                    '--disable-dev-shm-usage'
                ],
                headless: true,
            });
            this.logger.log('Puppeteer browser initialized');
        } catch (error) {
            this.logger.error('Failed to initialize puppeteer', error);
        };
    };



    /*
     * Generate or retrieve cached invoice PDF.
     * 
     * Workflow:
     * 1. Check if currently generating (prevent race conditions)
     * 2. Check if cached PDF exists and is fresh
     * 3. If not, generate new PDF
     * 4. Cache metadata in database
     * 5. Return PDF buffer
     */

    async getCachedPdf(userId, invoiceId: string) {
        return await this.db.invoicePdf.findUnique({where: {invoiceId}})
    }
    isPdfStale(cachedPdf: InvoicePdfDto) {
        if (!cachedPdf.expiresAt) return true;
        return cachedPdf.expiresAt && cachedPdf.expiresAt <= new Date();
    }

    async readPdfFromStorage(filePath: string) {
        const fullPath = path.join(this.pdfDir, filePath);
        return await fs.readFile(filePath);
    }
    async cachePdf(userId:string, invoice: InvoicePayload, pdfBuffer: Buffer): Promise<string> {
        const userDir = path.join(this.pdfDir, userId);
        await fs.mkdir(userDir, { recursive: true });

        const relativePath = path.join(userId, `${invoice.id}.pdf`);
        const fullPath = path.join(this.pdfDir, relativePath);

        await fs.writeFile(fullPath, pdfBuffer);

        this.logger.log(`PDF cached successfully for invoice ${invoice.id}`);
        return relativePath;
    }


    async generateInvoicePdf(userId, invoice: InvoicePayload): Promise<Buffer> {
        const invoiceId = invoice.id;
    
        // Wait if already generating this invoice
        while (this.generatingPdfs.has(invoiceId)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        }
    
        this.generatingPdfs.add(invoiceId);

    
        try {
        // TODO: Check cache (db table invoice_pdfs)
        const cachedPdf = await this.getCachedPdf(userId, invoice.id);

        if (cachedPdf && !this.isPdfStale(cachedPdf) && cachedPdf.filePath) {
            try {
                return await this.readPdfFromStorage(cachedPdf.filePath); 
            } catch (error) {
                this.logger.warn(`Cached PDF missing on disk for invoice ${invoiceId}, regenerating`, error)
            }
        }
    
        // Generate HTML from template
        const html = await this.renderInvoiceTemplate(invoice);
    
        // Render HTML to PDF with Puppeteer
        const pdfBuffer = await this.htmlToPdf(html);
    
        this.logger.log(`Generated PDF for invoice ${invoice.invoiceNumber}`);
    
        // TODO: Cache PDF to storage/database
        try {
            const relativePath = await this.cachePdf(userId, invoice, pdfBuffer)
            await this.db.invoicePdf.upsert({
                where: {invoiceId},
                update: {filePath: relativePath, fileSize: pdfBuffer.length, generatedAt: new Date()},
                create: {invoiceId, userId: invoice.userId, filePath: relativePath, fileSize: pdfBuffer.length}
            })
        } catch (error) {
            this.logger.warn(`Failed to cache PDF for invoice ${invoiceId}, continuing without cache`, error);
        }
        return pdfBuffer;
        } finally {
        this.generatingPdfs.delete(invoiceId);
        }
    }
    private async htmlToPdf(html: string): Promise<Buffer> {
        if (!this.browser) {
        throw new Error('Puppeteer browser not initialized');
        }
    
        const page = await this.browser.newPage();
    
        try {
        // Set content and wait for all resources to load
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
        // Generate PDF with A4 format and margins
        const pdfUint8Array = await page.pdf({
            format: 'A4',
            margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
            },
            // Display headers/footers if needed
            displayHeaderFooter: false,
            // printBackground: true, // Include background colors
        });
    
        return Buffer.from(pdfUint8Array);
        } finally {
        await page.close(); // Always close to free memory
        }
    }
    
    /**
     * Render invoice data into HTML template.
     * Uses Handlebars for template logic (loops, conditionals).
     */
    private async renderInvoiceTemplate(invoice: InvoicePayload): Promise<string> {
        // In production, load from file: await fs.readFile('path/to/template.hbs', 'utf-8')
        const templateHtml = getDefaultTemplate();
        const template = handlebars.compile(templateHtml);
    
        // Note: keys on the LEFT of each `:` below are Handlebars template
        // variable names (matching the {{...}} placeholders in getInvoiceTemplate()),
        // so they stay snake_case for template readability. Everything on the
        // RIGHT reads off `invoice.*`, which is a Prisma-generated object — those
        // reads must be camelCase (invoice.invoiceNumber, not invoice.invoice_number)
        // to match schema.prisma's field names. This is the one place a
        // straight TypeORM→Prisma port is easy to get subtly wrong: the object
        // you're building can use whatever casing you want, but the object
        // you're reading FROM is dictated by your Prisma schema.
        const data = {
        // Invoice metadata
        invoice_number: invoice.invoiceNumber,
        issue_date: this.formatDate(invoice.issueDate),
        due_date: this.formatDate(invoice.dueDate),
    
        // Issuer — invoice.user is populated because getInvoicePdf() fetches
        // with `include: { user: true }` (see InvoiceWithLineItems type above)
        issuer_name: invoice.user?.displayName || 'Invoice Generator',
        issuer_company: invoice.user?.companyName || '',
        issuer_cuit: invoice.user?.cuit || '',
        issuer_address: invoice.user?.address || '',
    
        // Client
        client_name: invoice.clientName,
        client_email: invoice.clientEmail || '',
        client_cuit: invoice.clientCuit || '',
        client_address: invoice.clientAddress || '',
    
        // Line items
        line_items: invoice.lineItems.map(item => ({
            description: item.description,
            quantity: this.formatNumber(Number(item.quantity)),
            rate: this.formatCurrency(Number(item.rate), invoice.currency),
            subtotal: this.formatCurrency(Number(item.subtotal), invoice.currency),
        })),
    
        // Totals — Prisma returns Decimal fields as a Decimal object, not a
        // plain number, so Number(...) is required here (same as it was with
        // TypeORM's numeric/decimal columns — this part doesn't change)
        subtotal: this.formatCurrency(Number(invoice.subtotal), invoice.currency),
        tax_amount: this.formatCurrency(Number(invoice.taxAmount), invoice.currency),
        total: this.formatCurrency(Number(invoice.total), invoice.currency),
        currency: invoice.currency,
    
        // Notes
        notes: invoice.notes || '',
        };
    
        return template(data);
    }
    
    
    // ========== HELPER METHODS ==========
    
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        }).format(new Date(date));
    }
    
    private formatCurrency(amount: number, currency: string): string {
        return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        }).format(amount);
    }
    
    private formatNumber(num: number): string {
        return new Intl.NumberFormat('es-AR').format(num);
    }
    
    // Cleanup on shutdown
    async onModuleDestroy() {
        if (this.browser) {
        await this.browser.close();
        }
    }
}


