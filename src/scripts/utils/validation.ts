import { VALIDATION } from '../constants';

type ValidationRule = {
  name: {
    isRequired: boolean;
    maxLength: number;
  };
  authors: {
    isRequired: boolean;
  };
  publishedDate: {
    isRequired: boolean;
    isFutureDate: (value: string) => boolean | '';
  };
  image: {
    isRequired: boolean;
  };
  description: {
    isRequired: boolean;
    maxLength: number;
  };
};

export type ValidationField = keyof ValidationRule;

const rules: ValidationRule = {
  name: {
    isRequired: true,
    maxLength: 120,
  },
  authors: {
    isRequired: true,
  },
  publishedDate: {
    isRequired: true,
    isFutureDate: (value: string) => value && new Date(value) > new Date(),
  },
  image: {
    isRequired: true,
  },
  description: {
    isRequired: true,
    maxLength: 1000,
  },
};

// Show error message
export const appendErrorMessage = <T extends HTMLElement>(inputElement: T, errorMessage: string) => {
  if (inputElement.parentElement === null) return;

  const errorElement = inputElement.parentElement.lastElementChild;

  if (errorElement !== null) errorElement.textContent = errorMessage;
};

// Remove error message
export const removeErrorMessage = <T extends HTMLElement>(inputElement: T) => {
  if (inputElement.parentElement === null) return;

  const errorElement = inputElement.parentElement.lastElementChild;

  if (errorElement !== null) errorElement.textContent = '';
};

// Validate all fields off form
export const validateForm = (fieldName: ValidationField, value: string, validateFieldName: string) => {
  const fieldRules = rules[fieldName];
  let errorMessage = '';

  // Check required field
  if (fieldRules.isRequired && !value.trim()) {
    errorMessage = VALIDATION.MESSAGE.IS_REQUIRED(validateFieldName);
  } else {
    // Check max-length
    if ('maxLength' in fieldRules && value.trim().length > fieldRules.maxLength) {
      errorMessage = VALIDATION.MESSAGE.MAX_LENGTH(validateFieldName, fieldRules.maxLength);
    }

    // Check future date
    if ('isFutureDate' in fieldRules && fieldRules.isFutureDate(value)) {
      errorMessage = VALIDATION.MESSAGE.IS_FUTURE_DATE(validateFieldName);
    }
  }

  return errorMessage;
};

// Validate a field
export const validateField = <T extends HTMLElement>(
  inputElement: T,
  fieldName: ValidationField,
  value: string,
  validateFieldName: string,
) => {
  const errorMessage = validateForm(fieldName, value, validateFieldName);

  if (errorMessage) {
    appendErrorMessage(inputElement, errorMessage);
  } else {
    removeErrorMessage(inputElement);
  }
};