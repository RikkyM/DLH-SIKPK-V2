export type ValidationErrors = Record<string, string[] | undefined>;

export type ApiError = {
    message?: string;
    errors?: ValidationErrors;
}