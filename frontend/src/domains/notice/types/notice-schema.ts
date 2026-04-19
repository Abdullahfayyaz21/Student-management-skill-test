import { z } from 'zod';

// ✅ Notice Form Schema - Field names match API
export const NoticeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"), // ✅ Must be 'description'
  status: z.union([z.string(), z.number()]),
  recipientType: z.enum(['EV', 'SP']),
  recipientRole: z.union([z.string(), z.number()]).optional(),
  firstField: z.string().optional(),
}); // ✅ NO semicolon here if chaining .superRefine()

// ✅ Recipient Schema
export const RecipientDetailSchema = z.object({
  roleId: z.number(),
  name: z.string(),
  primaryDependents: z.object({
    name: z.string(),
    list: z.array(z.object({
      id: z.number(),
      name: z.string(),
    })),
  }),
});

export const RecipientListData = z.array(RecipientDetailSchema);

export const NoticeRecipientSchema = z.object({
  recipientType: z.string(),
  recipientRole: z.union([z.string(), z.number()]).optional(),
  firstField: z.string().optional(),
});

// ✅ Types auto-inferred from schemas
export type NoticeFormProps = z.infer<typeof NoticeFormSchema>;
export type RecipientListData = z.infer<typeof RecipientDetailSchema>[];
export type NoticeRecipient = z.infer<typeof NoticeRecipientSchema>;