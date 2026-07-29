export function getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice {{invoice_number}}</title>
<style>
    ${getTokioNightStyles()}
</style>
</head>
<body>
<div class="invoice-container">
    <!-- Header: Invoice Title & Number -->
    <div class="header">
    <div class="header-left">
        <h1 class="invoice-title">FACTURA</h1>
        <p class="invoice-number">{{invoice_number}}</p>
    </div>
    <div class="header-right">
        <div class="date-box">
        <p><strong>Fecha de emisión:</strong> {{issue_date}}</p>
        <p><strong>Fecha de vencimiento:</strong> {{due_date}}</p>
        </div>
    </div>
    </div>

    <!-- Issuer & Client -->
    <div class="issuer-client">
    <div class="issuer">
        <h3>Emitido por:</h3>
        <p><strong>{{issuer_name}}</strong></p>
        {{#if issuer_company}}<p>{{issuer_company}}</p>{{/if}}
        {{#if issuer_cuit}}<p>CUIT: {{issuer_cuit}}</p>{{/if}}
        {{#if issuer_address}}<p>{{issuer_address}}</p>{{/if}}
    </div>
    <div class="client">
        <h3>Cliente:</h3>
        <p><strong>{{client_name}}</strong></p>
        {{#if client_email}}<p>{{client_email}}</p>{{/if}}
        {{#if client_cuit}}<p>CUIT: {{client_cuit}}</p>{{/if}}
        {{#if client_address}}<p>{{client_address}}</p>{{/if}}
    </div>
    </div>

    <!-- Line Items Table -->
    <table class="line-items">
    <thead>
        <tr>
        <th class="description">Descripción</th>
        <th class="qty">Cantidad</th>
        <th class="rate">Tarifa</th>
        <th class="subtotal">Subtotal</th>
        </tr>
    </thead>
    <tbody>
        {{#each line_items}}
        <tr>
        <td class="description">{{this.description}}</td>
        <td class="qty">{{this.quantity}}</td>
        <td class="rate">{{this.rate}}</td>
        <td class="subtotal">{{this.subtotal}}</td>
        </tr>
        {{/each}}
    </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
    <div class="totals">
        <div class="total-row">
        <span>Subtotal:</span>
        <span>{{subtotal}}</span>
        </div>
        <div class="total-row iva">
        <span>IVA (21%):</span>
        <span>{{tax_amount}}</span>
        </div>
        <div class="total-row total-amount">
        <span>TOTAL:</span>
        <span>{{total}}</span>
        </div>
    </div>
    </div>

    <!-- Notes -->
    {{#if notes}}
    <div class="notes">
    <h4>Notas:</h4>
    <p>{{notes}}</p>
    </div>
    {{/if}}

    <!-- Footer -->
    <div class="footer">
    <p>Generado por Invoice Generator | {{issue_date}}</p>
    </div>
</div>
</body>
</html>
    `;
}


function  getTokioNightStyles(): string {
    return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
        color: #192734;
        background: white;
        line-height: 1.6;
    }

    .invoice-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
    }

    /* Header */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        border-bottom: 3px solid #7aa2f7;
        padding-bottom: 20px;
    }

    .header-left {
        flex: 1;
    }

    .invoice-title {
        font-size: 2.5em;
        color: #7aa2f7;
        font-weight: 700;
        margin-bottom: 5px;
    }

    .invoice-number {
        font-size: 1.3em;
        color: #9ece6a;
        font-weight: 600;
    }

    .header-right {
        text-align: right;
    }

    .date-box {
        background: #f0f4ff;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #7aa2f7;
    }

    .date-box p {
        margin: 5px 0;
        font-size: 0.95em;
    }

    /* Issuer & Client */
    .issuer-client {
        display: flex;
        gap: 40px;
        margin-bottom: 40px;
    }

    .issuer, .client {
        flex: 1;
    }

    .issuer h3, .client h3 {
        color: #7aa2f7;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
    }

    .issuer p, .client p {
        margin: 4px 0;
        font-size: 0.95em;
    }

    /* Line Items Table */
    .line-items {
        width: 100%;
        border-collapse: collapse;
        margin: 40px 0;
    }

    .line-items thead {
        background: #f0f4ff;
        border-bottom: 2px solid #7aa2f7;
    }

    .line-items th {
        color: #7aa2f7;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .line-items th.qty,
    .line-items th.rate,
    .line-items th.subtotal {
        text-align: right;
    }

    .line-items td {
        padding: 12px;
        border-bottom: 1px solid #e8e8e8;
        font-size: 0.95em;
    }

    .line-items td.qty,
    .line-items td.rate,
    .line-items td.subtotal {
        text-align: right;
    }

    .line-items tbody tr:nth-child(odd) {
        background: #fafbff;
    }

    /* Totals */
    .totals-section {
        display: flex;
        justify-content: flex-end;
        margin: 40px 0;
    }

    .totals {
        width: 300px;
    }

    .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;
    }

    .total-row.iva {
        color: #9ece6a;
        font-weight: 600;
    }

    .total-row.total-amount {
        background: #7aa2f7;
        color: white;
        font-weight: 700;
        font-size: 1.1em;
        padding: 12px 15px;
        border-radius: 6px;
        margin-top: 10px;
        border: none;
    }

    /* Notes */
    .notes {
        background: #f9f9f9;
        padding: 15px;
        border-left: 4px solid #9ece6a;
        margin: 30px 0;
        border-radius: 4px;
    }

    .notes h4 {
        color: #9ece6a;
        margin-bottom: 8px;
        font-size: 0.95em;
    }

    .notes p {
        color: #666;
        font-size: 0.9em;
    }

    /* Footer */
    .footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        color: #999;
        font-size: 0.85em;
    }

    /* Print optimization */
    @media print {
        body {
        background: white;
        }
        .invoice-container {
        padding: 0;
        }
    }
    `;
}