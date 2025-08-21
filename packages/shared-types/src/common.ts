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
    file: any; // Using any for now to avoid File type issues
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

// Brew methods enum
export enum BrewMethod {
    V60 = 'V60',
    AEROPRESS = 'Aeropress',
    CHEMEX = 'Chemex',
    KALITA_WAVE = 'Kalita Wave',
    FRENCH_PRESS = 'French Press',
    ESPRESSO = 'Espresso',
    POUR_OVER = 'Pour Over',
    COLD_BREW = 'Cold Brew',
    OTHER = 'Other',
}

// Rating enum
export enum Rating {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}

// Grind size options
export const GRIND_SIZES = [
    'Extra Fine',
    'Fine',
    'Medium-Fine',
    'Medium',
    'Medium-Coarse',
    'Coarse',
    'Extra Coarse',
] as const;

export type GrindSize = typeof GRIND_SIZES[number];

// Temperature units
export enum TemperatureUnit {
    CELSIUS = 'C',
    FAHRENHEIT = 'F',
}

// Time format utilities
export const formatBrewTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const parseBrewTime = (timeString: string): number => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + (seconds || 0);
};

// Coffee ratio calculation
export const calculateRatio = (coffeeWeight: number, waterWeight: number): number => {
    if (coffeeWeight === 0) return 0;
    return waterWeight / coffeeWeight;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult => {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    }

    if (!/[A-Z]/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
    }

    if (!/[a-z]/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
    }

    if (!/\d/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one number' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
