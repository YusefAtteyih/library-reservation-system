import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/constants';

/**
 * Common form validation schemas
 */
export const validationSchemas = {
  email: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
    .email({ message: VALIDATION_MESSAGES.EMAIL }),
  
  password: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
    .min(6, { message: VALIDATION_MESSAGES.MIN_LENGTH(6) }),
  
  name: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
    .min(2, { message: VALIDATION_MESSAGES.MIN_LENGTH(2) }),
  
  phone: z
    .string()
    .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
    .regex(/^\+?[0-9\s-]+$/, { message: 'Please enter a valid phone number' }),
  
  url: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .or(z.literal('')),
  
  date: z
    .string()
    .datetime({ message: VALIDATION_MESSAGES.INVALID_DATE })
    .or(z.date()),
  
  number: z
    .number({ invalid_type_error: 'Must be a number' })
    .or(z.string().regex(/^\d+$/, 'Must be a number')),
};

/**
 * Create a form data object from form elements
 * @param form - HTML form element
 * @returns Form data as a plain object
 */
export const getFormData = <T extends Record<string, any>>(form: HTMLFormElement): T => {
  const formData = new FormData(form);
  const data: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    const element = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | null;
    
    if (!element) continue;
    
    if (element.type === 'checkbox') {
      if (!data[key]) {
        data[key] = [];
      }
      if (value) {
        data[key].push(value);
      }
    } else if (element.type === 'radio') {
      if (element.checked) {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }
  
  return data as T;
};

/**
 * Set form field values from an object
 * @param form - HTML form element
 * @param data - Object containing field values
 */
export const setFormValues = (form: HTMLFormElement, data: Record<string, any>): void => {
  Object.entries(data).forEach(([key, value]) => {
    const element = form.elements.namedItem(key);
    
    if (!element) return;
    
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        element.checked = Array.isArray(value)
          ? value.includes(element.value)
          : !!value;
      } else if (element.type === 'radio') {
        element.checked = element.value === value;
      } else {
        element.value = value ?? '';
      }
    } else if (element instanceof HTMLSelectElement) {
      const values = Array.isArray(value) ? value : [value];
      
      for (let i = 0; i < element.options.length; i++) {
        element.options[i].selected = values.includes(element.options[i].value);
      }
    }
  });
};

/**
 * Reset form fields to their default values
 * @param form - HTML form element
 */
export const resetForm = (form: HTMLFormElement): void => {
  form.reset();
};

/**
 * Validate form fields against a Zod schema
 * @param form - HTML form element
 * @param schema - Zod schema for validation
 * @returns Object containing validation result and errors
 */
export const validateForm = <T extends z.ZodTypeAny>(
  form: HTMLFormElement,
  schema: T
): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } => {
  const formData = getFormData<Record<string, any>>(form);
  
  try {
    const validatedData = schema.parse(formData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      
      return { success: false, errors };
    }
    
    // For unexpected errors, rethrow
    throw error;
  }
};

/**
 * Display form validation errors in the UI
 * @param form - HTML form element
 * @param errors - Object containing field errors
 */
export const displayFormErrors = (
  form: HTMLFormElement,
  errors: Record<string, string>
): void => {
  // Clear previous error messages
  form.querySelectorAll('.error-message').forEach((el) => el.remove());
  
  Object.entries(errors).forEach(([field, message]) => {
    const input = form.elements.namedItem(field) as HTMLElement;
    if (!input) return;
    
    // Add error class to the input
    input.classList.add('border-red-500');
    
    // Create error message element
    const errorElement = document.createElement('p');
    errorElement.className = 'mt-1 text-sm text-red-600 error-message';
    errorElement.textContent = message;
    
    // Insert after the input
    const formGroup = input.closest('.form-group') || input.parentElement;
    if (formGroup) {
      formGroup.appendChild(errorElement);
    } else {
      input.insertAdjacentElement('afterend', errorElement);
    }
  });
};

/**
 * Handle form submission with validation
 * @param form - HTML form element
 * @param schema - Zod schema for validation
 * @param onSubmit - Callback function when form is valid
 * @returns Promise that resolves when submission is complete
 */
export const handleFormSubmit = async <T extends z.ZodTypeAny, R = void>(
  form: HTMLFormElement,
  schema: T,
  onSubmit: (data: z.infer<T>) => Promise<R>
): Promise<{ success: boolean; result?: R; errors?: Record<string, string> }> => {
  // Prevent default form submission
  const submitEvent = new Event('submit', { cancelable: true });
  if (!form.dispatchEvent(submitEvent)) {
    return { success: false };
  }
  
  // Validate form
  const { success, data, errors } = validateForm(form, schema);
  
  if (!success || !data) {
    displayFormErrors(form, errors || {});
    return { success: false, errors };
  }
  
  try {
    const result = await onSubmit(data);
    return { success: true, result };
  } catch (error) {
    // Handle API validation errors
    if (error.response?.data?.errors) {
      displayFormErrors(form, error.response.data.errors);
      return { success: false, errors: error.response.data.errors };
    }
    
    // Rethrow unexpected errors
    throw error;
  }
};

/**
 * Debounce a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle a function
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<F>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
