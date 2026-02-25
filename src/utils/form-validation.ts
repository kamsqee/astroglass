import { safeParse } from 'valibot';

export interface FormValidationConfig {
  form: HTMLFormElement;
  schema: any;
  /**
   * Optional custom error renderer. 
   * If not provided, defaults to the standard dynamic <p class="error-message"> insertion.
   */
  renderError?: (input: HTMLElement, message: string) => void;
  clearError?: (input: HTMLElement) => void;
}

export const defaultRenderError = (input: HTMLElement, message: string) => {
    const parent = input.closest('.form-control') || input.closest('div.input-group') || input.parentElement;
    if (!parent) return;
    
    // Clean up old
    parent.querySelector('.error-message')?.remove();
    input.classList.add('input-error');
    
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-message';
    errorMsg.innerHTML = `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${message}`;
    parent.appendChild(errorMsg);
};

export const defaultClearError = (input: HTMLElement) => {
    input.classList.remove('input-error');
    const parent = input.closest('.form-control') || input.closest('div.input-group') || input.parentElement;
    parent?.querySelector('.error-message')?.remove();
};

/**
 * Validates a single field against the schema (useful for onBlur / onInput).
 */
export function validateSingleField(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  config: FormValidationConfig
): boolean {
  const render = config.renderError || defaultRenderError;
  const clear = config.clearError || defaultClearError;
  
  const fieldName = input.name;
  if (!fieldName) return true;
  
  const formData = new FormData(config.form);
  const data: Record<string, any> = {};
  formData.forEach((value, key) => data[key] = value);
  
  // Clear current field status
  clear(input);
  input.classList.remove('input-success');
  
  const result = safeParse(config.schema, data);
  
  if (!result.success) {
    const issue = result.issues.find(i => i.path?.[0].key === fieldName);
    if (issue) {
      render(input, issue.message);
      return false;
    } else {
      if (input.value.trim().length > 0) input.classList.add('input-success');
      return true;
    }
  } else {
    if (input.value.trim().length > 0) input.classList.add('input-success');
    return true;
  }
}

/**
 * Validates the entire form and displays errors for all invalid fields.
 */
export function validateForm(config: FormValidationConfig): { success: boolean; data?: Record<string, any> } {
  const render = config.renderError || defaultRenderError;
  const clear = config.clearError || defaultClearError;
  
  const formData = new FormData(config.form);
  const data: Record<string, any> = {};
  formData.forEach((value, key) => data[key] = value);
  
  // Clear all existing errors before full validation
  config.form.querySelectorAll('input, select, textarea').forEach(el => {
     clear(el as HTMLElement);
  });
  
  const result = safeParse(config.schema, data);
  
  if (!result.success) {
    let firstInvalid: HTMLElement | null = null;
    
    result.issues.forEach(issue => {
      const fieldName = issue.path?.[0].key as string;
      const input = config.form.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (input) {
         if (!firstInvalid) firstInvalid = input;
         render(input, issue.message);
      }
    });
    
    // Optionally trigger a shake animation on the form
    config.form.classList.add('animate-shake');
    setTimeout(() => config.form.classList.remove('animate-shake'), 300);
    
    if (firstInvalid) {
      // Scroll into view if needed, but definitely focus
      (firstInvalid as HTMLElement).focus();
    }
    
    return { success: false };
  }
  
  return { success: true, data };
}
