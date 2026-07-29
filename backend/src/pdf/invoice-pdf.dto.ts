export interface InvoicePdfDto {
    id: string;
    invoiceId: string;
    userId: string;

    filePath: string | null;
    fileSize: number | null;
    generatedAt: Date;
    expiresAt: Date | null;
}