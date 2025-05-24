import { AxiosError } from 'axios';
import { toast } from 'sonner';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): string => {
  let errorMessage = 'An unexpected error occurred';

  if (error instanceof AppError) {
    errorMessage = error.message;
  } else if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { data, status } = error.response;
      
      if (status === 401) {
        errorMessage = 'You are not authorized to perform this action';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to access this resource';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found';
      } else if (status === 409) {
        errorMessage = 'A resource with this data already exists';
      } else if (status === 422) {
        // Handle validation errors
        const validationErrors = data?.errors || [];
        if (validationErrors.length > 0) {
          return validationErrors.map((err: any) => err.msg || err.message).join('\n');
        }
        errorMessage = data?.message || 'Validation failed';
      } else if (status >= 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      } else {
        errorMessage = data?.message || error.message;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      errorMessage = 'No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    // Handle other Error instances
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return errorMessage;
};

export const showError = (error: unknown, defaultMessage?: string): void => {
  const message = handleError(error);
  toast.error(message || defaultMessage || 'An error occurred');
};

export const showSuccess = (message: string): void => {
  toast.success(message);
};

export const showInfo = (message: string): void => {
  toast.info(message);
};

export const showWarning = (message: string): void => {
  toast.warning(message);
};
