

## Plan

### 1. Add Product Management Page

Create a new `src/pages/admin/Products.tsx` page that allows admins to:
- View all products in a table (active and inactive)
- Add new products via a dialog form (name, product code, description, category, default unit price, default VAT %)
- Edit existing products inline or via dialog
- Deactivate/reactivate products

Add a "Products" menu item to `AppSidebar.tsx` and a route in `App.tsx`.

### 2. Add Payment Details to Company Settings & Invoices

**Database migration:** Add `payment_details` text column to `company_settings` table with default value:
```
Bank: KCB KICC Branch
A/C: 1329591283
Paybill: 522533
A/C No: 9097900
```

**Settings page:** Add a "Payment Details" textarea field in `src/pages/Settings.tsx` so the admin can edit it.

**PDF Generator:** Add a "PAYMENT DETAILS" section to `src/utils/pdfGenerator.ts` that renders the bank details on every invoice.

**Invoice Preview:** Show payment details in the live preview on `CreateInvoice.tsx`.

### 3. Hook for Product CRUD

Create `src/hooks/useProductManagement.ts` with mutations for insert, update, and soft-delete (toggle `is_active`) on the `products` table.

### Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/pages/admin/Products.tsx` |
| Create | `src/hooks/useProductManagement.ts` |
| Modify | `src/components/AppSidebar.tsx` — add Products nav item |
| Modify | `src/App.tsx` — add `/admin/products` route |
| Modify | `src/pages/Settings.tsx` — add payment details field |
| Modify | `src/hooks/useCompanySettings.ts` — include `payment_details` |
| Modify | `src/utils/pdfGenerator.ts` — render payment details section |
| Modify | `src/pages/CreateInvoice.tsx` — show payment details in preview |
| Migration | Add `payment_details` column to `company_settings` |

