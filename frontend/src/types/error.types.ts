export type ValidationErrors = Record<string, string[]>;

export type ApiError = {
    message?: string;
    errors?: ValidationErrors;
}