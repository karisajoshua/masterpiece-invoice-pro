import { z } from "zod";

export const clientRegistrationSchema = z.object({
  accountType: z.enum(["individual", "company"]),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  confirmPassword: z.string(),
  companyName: z.string().min(2).max(200).optional(),
  companyPin: z.string().regex(/^[A-Z0-9]+$/, "PIN must contain only uppercase letters and numbers").optional(),
  contactPerson: z.string().min(2).max(100).optional(),
  phonePrimary: z.string().regex(/^\+?[0-9\s-]+$/, "Invalid phone number format").optional(),
  phoneSecondary: z.string().regex(/^\+?[0-9\s-]+$/, "Invalid phone number format").optional(),
  billingAddress: z.string().min(5).max(500).optional(),
  physicalAddress: z.string().max(500).optional(),
  industry: z.string().optional(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine(data => {
  if (data.accountType === "company") {
    return !!(data.companyName && data.companyPin && data.contactPerson && 
           data.phonePrimary && data.billingAddress);
  }
  return true;
}, {
  message: "All company fields are required when registering as a company",
  path: ["companyName"],
});