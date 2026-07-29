import { Prisma } from "@prisma/client"

export type InvoicePayload = Prisma.InvoiceGetPayload<{
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
                logoUrl: true,
            }
        }
    }
}>

