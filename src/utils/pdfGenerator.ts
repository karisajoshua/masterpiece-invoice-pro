import jsPDF from "jspdf";
import { Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { CompanySettings } from "@/hooks/useCompanySettings";
import masterpieceLogo from "@/assets/masterpiece-logo.png";

export async function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  settings: CompanySettings
) {
  const pdf = new jsPDF();
  
  // Blue and red header bands
  pdf.setFillColor(39, 42, 108); // Blue #272a6c
  pdf.rect(0, 0, 210, 15, "F");
  
  pdf.setFillColor(220, 38, 38); // Red
  pdf.rect(0, 15, 210, 3, "F");
  
  pdf.setFillColor(255, 255, 255); // White spacer
  pdf.rect(0, 18, 210, 2, "F");

  // Add company logo (larger and repositioned)
  try {
    const img = await loadImage(masterpieceLogo);
    pdf.addImage(img, "PNG", 15, 22, 50, 25);
  } catch (error) {
    console.error("Failed to load logo:", error);
  }

  // Company details
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(settings.company_name, 15, 52);
  pdf.text(`PIN: ${settings.company_pin}`, 15, 57);
  if (settings.address) pdf.text(settings.address, 15, 62);
  pdf.text(`${settings.phone_1} | ${settings.email}`, 15, 67);

  // Invoice title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(39, 42, 108);
  pdf.text("INVOICE", 150, 30);

  // Invoice details
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Invoice No: ${invoice.invoice_no}`, 150, 40);
  pdf.text(`Date: ${new Date(invoice.date_issued).toLocaleDateString()}`, 150, 45);
  if (invoice.reference) pdf.text(`Reference: ${invoice.reference}`, 150, 50);
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, 150, 55);

  // Client details
  pdf.setFont("helvetica", "bold");
  pdf.text("BILL TO:", 15, 77);
  pdf.setFont("helvetica", "normal");
  let clientY = 82;
  pdf.text(invoice.client_name, 15, clientY);
  clientY += 5;
  
  if (invoice.billing_address) {
    const addressLines = pdf.splitTextToSize(invoice.billing_address, 80);
    pdf.text(addressLines, 15, clientY);
    clientY += addressLines.length * 5;
  }
  if (invoice.client_email) {
    pdf.text(invoice.client_email, 15, clientY);
    clientY += 5;
  }
  if (invoice.client_phone) {
    pdf.text(invoice.client_phone, 15, clientY);
    clientY += 5;
  }

  // Line items table with blue header
  let yPos = 110;
  pdf.setFillColor(39, 42, 108);
  pdf.rect(15, yPos - 5, 180, 8, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("Description", 17, yPos);
  pdf.text("Qty", 78, yPos, { align: "center" });
  pdf.text("Unit Price", 115, yPos, { align: "right" });
  pdf.text("VAT %", 135, yPos, { align: "center" });
  pdf.text("Total", 190, yPos, { align: "right" });
  
  yPos += 8;
  pdf.setTextColor(0, 0, 0);

  // Items with alternating row colors
  pdf.setFont("helvetica", "normal");
  items.forEach((item, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPos - 5, 180, 7, "F");
    }
    const lineTotal = item.qty * item.unit_price * (1 + item.vat_percent / 100);
    pdf.text(item.description, 17, yPos, { maxWidth: 55 });
    pdf.text(item.qty.toString(), 78, yPos, { align: "center" });
    pdf.text(`${settings.currency_label} ${item.unit_price.toLocaleString()}`, 115, yPos, { align: "right" });
    pdf.text(`${item.vat_percent}%`, 135, yPos, { align: "center" });
    pdf.text(`${settings.currency_label} ${lineTotal.toLocaleString()}`, 190, yPos, { align: "right" });
    yPos += 7;
  });

  // Totals section with blue background
  yPos += 10;
  pdf.setFillColor(39, 42, 108);
  pdf.rect(15, yPos - 5, 180, 28, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  
  // Subtotal
  pdf.text("Subtotal:", 25, yPos);
  pdf.text(`${settings.currency_label} ${invoice.subtotal.toLocaleString()}`, 185, yPos, { align: "right" });
  
  yPos += 7;
  // VAT Total
  pdf.text("VAT Total:", 25, yPos);
  pdf.text(`${settings.currency_label} ${invoice.vat_total.toLocaleString()}`, 185, yPos, { align: "right" });
  
  yPos += 10;
  // Grand Total - larger and prominent
  pdf.setFontSize(13);
  pdf.text("GRAND TOTAL:", 25, yPos);
  pdf.text(`${settings.currency_label} ${invoice.grand_total.toLocaleString()}`, 185, yPos, { align: "right" });
  
  yPos += 10;
  pdf.setTextColor(0, 0, 0);

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

  // Footer
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text("Powered by Texcortech Systems", 105, pageHeight - 10, { align: "center" });

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
