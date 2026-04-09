import type { ValidationErrors } from "@/types/error.types";
import React from "react";

export const useFormErrors = () => {
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const getError = (field: string) => {
    return errors[field]?.[0];
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const setValidationErrors = (errs: ValidationErrors) => {
    setErrors(errs);
  };

  const resetErrors = () => {
    setErrors({});
  };

  return {
    errors,
    getError,
    clearError,
    setValidationErrors,
    resetErrors,
  };
};
