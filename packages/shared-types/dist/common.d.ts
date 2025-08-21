export interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}
export interface PaginationParams {
    limit?: number;
    offset?: number;
    page?: number;
}
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SearchParams {
    search?: string;
    q?: string;
}
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}
export interface FileUpload {
    file: any;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}
export declare enum BrewMethod {
    V60 = "V60",
    AEROPRESS = "Aeropress",
    CHEMEX = "Chemex",
    KALITA_WAVE = "Kalita Wave",
    FRENCH_PRESS = "French Press",
    ESPRESSO = "Espresso",
    POUR_OVER = "Pour Over",
    COLD_BREW = "Cold Brew",
    OTHER = "Other"
}
export declare enum Rating {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5
}
export declare const GRIND_SIZES: readonly ["Extra Fine", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse", "Extra Coarse"];
export type GrindSize = typeof GRIND_SIZES[number];
export declare enum TemperatureUnit {
    CELSIUS = "C",
    FAHRENHEIT = "F"
}
export declare const formatBrewTime: (seconds: number) => string;
export declare const parseBrewTime: (timeString: string) => number;
export declare const calculateRatio: (coffeeWeight: number, waterWeight: number) => number;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => ValidationResult;
