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
  
  // Set default font to Times (more professional for business documents)
  pdf.setFont("times", "normal");
  
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

  // Company details - Times for elegant business look
  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  pdf.text(settings.company_name, 15, 52);
  pdf.text(`PIN: ${settings.company_pin}`, 15, 57);
  if (settings.address) pdf.text(settings.address, 15, 62);
  pdf.text(`${settings.phone_1} | ${settings.email}`, 15, 67);

  // Invoice title - Bold and prominent
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(39, 42, 108);
  pdf.text("INVOICE", 195, 32, { align: "right" });

  // Invoice details - Clean sans-serif
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  
  let detailY = 40;
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice No:", 145, detailY);
  pdf.setFont("helvetica", "normal");
  pdf.text(invoice.invoice_no, 195, detailY, { align: "right" });
  
  detailY += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", 145, detailY);
  pdf.setFont("helvetica", "normal");
  pdf.text(new Date(invoice.date_issued).toLocaleDateString(), 195, detailY, { align: "right" });
  
  if (invoice.reference) {
    detailY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Reference:", 145, detailY);
    pdf.setFont("helvetica", "normal");
    pdf.text(invoice.reference, 195, detailY, { align: "right" });
  }
  
  // Payment Status with enhanced coloring
  detailY += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Status:", 145, detailY);
  pdf.setFont("helvetica", "normal");
  
  let paymentStatusText = "";
  let statusColor = [39, 42, 108]; // Default blue
  
  if (invoice.payment_status === "fully_paid" || invoice.status === "paid") {
    statusColor = [34, 139, 34]; // Green
    paymentStatusText = "FULLY PAID";
  } else if (invoice.payment_status === "partial") {
    statusColor = [255, 140, 0]; // Orange
    paymentStatusText = "PARTIALLY PAID";
  } else if (invoice.payment_status === "paid_pending_approval") {
    statusColor = [255, 180, 0]; // Amber
    paymentStatusText = "PENDING APPROVAL";
  } else if (invoice.status === "overdue") {
    statusColor = [220, 38, 38]; // Red
    paymentStatusText = "OVERDUE";
  } else {
    paymentStatusText = "UNPAID";
  }
  
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(paymentStatusText, 195, detailY, { align: "right" });

  // Client details section
  pdf.setTextColor(39, 42, 108);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("BILL TO", 15, 77);
  
  // Underline for section header
  pdf.setDrawColor(39, 42, 108);
  pdf.setLineWidth(0.5);
  pdf.line(15, 78.5, 45, 78.5);
  
  pdf.setFont("times", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  let clientY = 84;
  pdf.text(invoice.client_name, 15, clientY);
  clientY += 5;
  
  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(70, 70, 70);
  
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
  let yPos = Math.max(110, clientY + 8);
  pdf.setFillColor(39, 42, 108);
  pdf.rect(15, yPos - 5, 180, 8, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text("DESCRIPTION", 17, yPos);
  pdf.text("QTY", 78, yPos, { align: "center" });
  pdf.text("UNIT PRICE", 115, yPos, { align: "right" });
  pdf.text("VAT %", 135, yPos, { align: "center" });
  pdf.text("TOTAL", 190, yPos, { align: "right" });
  
  yPos += 8;
  pdf.setTextColor(50, 50, 50);

  // Items with alternating row colors
  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  items.forEach((item, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 252);
      pdf.rect(15, yPos - 5, 180, 7, "F");
    }
    const lineTotal = item.qty * item.unit_price * (1 + item.vat_percent / 100);
    pdf.text(item.description, 17, yPos, { maxWidth: 55 });
    pdf.text(item.qty.toString(), 78, yPos, { align: "center" });
    pdf.text(`${settings.currency_label} ${item.unit_price.toLocaleString()}`, 115, yPos, { align: "right" });
    pdf.text(`${item.vat_percent}%`, 135, yPos, { align: "center" });
    pdf.setFont("times", "bold");
    pdf.text(`${settings.currency_label} ${lineTotal.toLocaleString()}`, 190, yPos, { align: "right" });
    pdf.setFont("times", "normal");
    yPos += 7;
  });

  // Totals section with blue background
  yPos += 10;
  
  // Calculate height needed for totals section (includes payment info if partial payments exist)
  const hasPayments = invoice.total_paid > 0;
  const totalsHeight = hasPayments ? 45 : 28;
  
  pdf.setFillColor(39, 42, 108);
  pdf.rect(110, yPos - 5, 85, totalsHeight, "F");
  
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  
  // Subtotal
  pdf.text("Subtotal:", 115, yPos);
  pdf.text(`${settings.currency_label} ${invoice.subtotal.toLocaleString()}`, 190, yPos, { align: "right" });
  
  yPos += 7;
  // VAT Total
  pdf.text("VAT Total:", 115, yPos);
  pdf.text(`${settings.currency_label} ${invoice.vat_total.toLocaleString()}`, 190, yPos, { align: "right" });
  
  yPos += 7;
  // Grand Total - larger and prominent
  pdf.setFont("helvetica", "bold");
  pdf.text("Grand Total:", 115, yPos);
  pdf.text(`${settings.currency_label} ${invoice.grand_total.toLocaleString()}`, 190, yPos, { align: "right" });
  
  // Payment Summary (if partial payments exist)
  if (hasPayments) {
    yPos += 10;
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.line(115, yPos - 3, 190, yPos - 3);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Amount Paid:", 115, yPos);
    pdf.text(`${settings.currency_label} ${invoice.total_paid.toLocaleString()}`, 190, yPos, { align: "right" });
    
    yPos += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    const balanceDue = invoice.balance_due ?? (invoice.grand_total - invoice.total_paid);
    pdf.text("BALANCE DUE:", 115, yPos);
    pdf.text(`${settings.currency_label} ${balanceDue.toLocaleString()}`, 190, yPos, { align: "right" });
  }
  
  yPos += 15;
  pdf.setTextColor(50, 50, 50);

  // Notes section
  if (invoice.notes) {
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(39, 42, 108);
    pdf.text("Notes", 15, yPos);
    pdf.setDrawColor(39, 42, 108);
    pdf.line(15, yPos + 1.5, 35, yPos + 1.5);
    
    pdf.setFont("times", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(70, 70, 70);
    pdf.text(invoice.notes, 15, yPos + 6, { maxWidth: 180 });
    yPos += 15;
  }

  // Payment Details section
  if (settings.payment_details) {
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(39, 42, 108);
    pdf.text("PAYMENT DETAILS", 15, yPos);
    pdf.setDrawColor(39, 42, 108);
    pdf.line(15, yPos + 1.5, 60, yPos + 1.5);
    
    pdf.setFont("times", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(50, 50, 50);
    const paymentLines = settings.payment_details.split("\n");
    paymentLines.forEach((line) => {
      yPos += 5;
      pdf.text(line, 15, yPos);
    });
  }

  // Payment terms
  yPos += 10;
  pdf.setFont("times", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(settings.payment_terms_text, 15, yPos, { maxWidth: 180 });

  // Footer
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
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
