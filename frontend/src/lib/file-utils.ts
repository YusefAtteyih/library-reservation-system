/**
 * Read a file as a data URL
 * @param file - File to read
 * @returns Promise that resolves with the data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file: No result from FileReader'));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Error reading file: ${reader.error?.message || 'Unknown error'}`));
    };

    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @returns True if file size is valid, false otherwise
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed, false otherwise
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Read a file as text
 * @param file - File to read
 * @returns Promise that resolves with the file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Convert a file size in bytes to a human-readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Human-readable file size
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Get the file extension from a filename
 * @param filename - Filename or path
 * @returns File extension (without the dot) or empty string if no extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if a file has an allowed extension
 * @param file - File object or filename
 * @param allowedExtensions - Array of allowed extensions (without the dot)
 * @returns boolean
 */
export const hasAllowedExtension = (
  file: File | string,
  allowedExtensions: string[]
): boolean => {
  const filename = typeof file === 'string' ? file : file.name;
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension.toLowerCase());
};

/**
 * Check if a file's MIME type is allowed
 * @param file - File object
 * @param allowedMimeTypes - Array of allowed MIME types
 * @returns boolean
 */
export const hasAllowedMimeType = (
  file: File,
  allowedMimeTypes: string[]
): boolean => {
  return allowedMimeTypes.includes(file.type);
};

/**
 * Check if a file is within the allowed size limit
 * @param file - File object
 * @param maxSizeInBytes - Maximum allowed file size in bytes
 * @returns boolean
 */
export const isWithinSizeLimit = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate a file against size and type constraints
 * @param file - File to validate
 * @param options - Validation options
 * @returns Object with validation result and error message if invalid
 */
export const validateFile = (
  file: File,
  options: {
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
    maxSizeInBytes?: number;
  } = {}
): { isValid: boolean; error?: string } => {
  const { allowedExtensions, allowedMimeTypes, maxSizeInBytes } = options;
  
  // Check file size
  if (maxSizeInBytes !== undefined && !isWithinSizeLimit(file, maxSizeInBytes)) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${formatFileSize(maxSizeInBytes)}.`,
    };
  }
  
  // Check file extension
  if (allowedExtensions?.length && !hasAllowedExtension(file, allowedExtensions)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}.`,
    };
  }
  
  // Check MIME type
  if (allowedMimeTypes?.length && !hasAllowedMimeType(file, allowedMimeTypes)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed MIME types: ${allowedMimeTypes.join(', ')}.`,
    };
  }
  
  return { isValid: true };
};

/**
 * Create a download link for a file
 * @param data - File data as ArrayBuffer, Blob, or string
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file
 */
export const downloadFile = (
  data: ArrayBuffer | Blob | string,
  filename: string,
  mimeType: string
): void => {
  let blob: Blob;
  
  if (data instanceof Blob) {
    blob = data;
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mimeType });
  } else {
    blob = new Blob([data], { type: mimeType });
  }
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

/**
 * Convert a base64 string to a Blob
 * @param base64 - Base64 string
 * @param mimeType - MIME type of the file
 * @returns Blob object
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }
  
  const byteArray = new Uint8Array(byteArrays);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Get image dimensions from a file
 * @param file - Image file
 * @returns Promise that resolves with the image dimensions { width, height }
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = (error) => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress an image file
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Promise that resolves with the compressed Blob
 */
export const compressImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  } = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const { maxWidth = 1024, maxHeight = 1024, quality = 0.8, mimeType = 'image/jpeg' } = options;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
