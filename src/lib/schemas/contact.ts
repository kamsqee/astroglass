import { object, string, email, minLength, maxLength, pipe, optional, type InferInput } from 'valibot';

/**
 * Creates a localized validation schema for the contact form.
 * 
 * @param t - Translation function (e.g., from useTranslations)
 * @returns Valibot schema
 */
interface SchemaOptions {
  companyRequired?: boolean;
}

export const createContactSchema = (t: (key: string) => string, options: SchemaOptions = {}) => {
  return object({
    name: pipe(
      string(),
      minLength(2, t('validation.nameShort') || 'Name is too short'),
      maxLength(50, t('validation.nameLong') || 'Name is too long')
    ),
    email: pipe(
      string(),
      email(t('validation.emailInvalid') || 'Invalid email address')
    ),
    message: pipe(
      string(),
      minLength(10, t('validation.messageShort') || 'Message must be at least 10 characters'),
      maxLength(1000, t('validation.messageLong') || 'Message is too long')
    ),
    // Conditional validation for company
    company: options.companyRequired
      ? pipe(
          string(),
          minLength(1, t('validation.required') || 'This field is required')
        )
      : optional(string()),
      
    topic: optional(string()),
    scale: optional(string()),
  });
};

// Type inference helper (liquid uses InferInput)
export type ContactFormValues = InferInput<ReturnType<typeof createContactSchema>>;
