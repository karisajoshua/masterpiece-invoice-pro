import jsPDF from "jspdf";
import { Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { CompanySettings } from "@/hooks/useCompanySettings";

export async function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  settings: CompanySettings
) {
  const pdf = new jsPDF();
  
  // Add company logo if available
  if (settings.logo_url) {
    try {
      const img = await loadImage(settings.logo_url);
      pdf.addImage(img, "PNG", 15, 10, 40, 20);
    } catch (error) {
      console.error("Failed to load logo:", error);
    }
  }

  // Company details
  pdf.setFontSize(10);
  pdf.text(settings.company_name, 15, 35);
  pdf.text(`PIN: ${settings.company_pin}`, 15, 40);
  if (settings.address) pdf.text(settings.address, 15, 45);
  pdf.text(`${settings.phone_1} | ${settings.email}`, 15, 50);

  // Invoice title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", 150, 20);

  // Invoice details
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: ${invoice.invoice_no}`, 150, 30);
  pdf.text(`Date: ${new Date(invoice.date_issued).toLocaleDateString()}`, 150, 35);
  if (invoice.reference) pdf.text(`Reference: ${invoice.reference}`, 150, 40);
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, 150, 45);

  // Client details
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", 15, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text(invoice.client_name, 15, 70);
  if (invoice.billing_address) pdf.text(invoice.billing_address, 15, 75);
  if (invoice.client_email) pdf.text(invoice.client_email, 15, 80);
  if (invoice.client_phone) pdf.text(invoice.client_phone, 15, 85);

  // Line items table
  let yPos = 100;
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 15, yPos);
  pdf.text("Qty", 100, yPos);
  pdf.text("Unit Price", 120, yPos);
  pdf.text("VAT %", 150, yPos);
  pdf.text("Total", 175, yPos);
  
  pdf.line(15, yPos + 2, 195, yPos + 2);
  yPos += 8;

  // Items
  pdf.setFont("helvetica", "normal");
  items.forEach((item) => {
    const lineTotal = item.qty * item.unit_price * (1 + item.vat_percent / 100);
    pdf.text(item.description, 15, yPos, { maxWidth: 80 });
    pdf.text(item.qty.toString(), 100, yPos);
    pdf.text(`${settings.currency_label} ${item.unit_price.toLocaleString()}`, 120, yPos);
    pdf.text(`${item.vat_percent}%`, 150, yPos);
    pdf.text(`${settings.currency_label} ${lineTotal.toLocaleString()}`, 175, yPos);
    yPos += 7;
  });

  // Totals
  yPos += 10;
  pdf.line(15, yPos - 5, 195, yPos - 5);
  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal:", 140, yPos);
  pdf.text(`${settings.currency_label} ${invoice.subtotal.toLocaleString()}`, 175, yPos);
  yPos += 6;
  pdf.text("VAT Total:", 140, yPos);
  pdf.text(`${settings.currency_label} ${invoice.vat_total.toLocaleString()}`, 175, yPos);
  yPos += 8;
  pdf.setFontSize(12);
  pdf.text("GRAND TOTAL:", 140, yPos);
  pdf.text(`${settings.currency_label} ${invoice.grand_total.toLocaleString()}`, 175, yPos);

  // Notes
  if (invoice.notes) {
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes:", 15, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(invoice.notes, 15, yPos + 5, { maxWidth: 180 });
  }

  // Payment terms
  yPos += 20;
  pdf.setFontSize(9);
  pdf.text(settings.payment_terms_text, 15, yPos, { maxWidth: 180 });

  return pdf;
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}
