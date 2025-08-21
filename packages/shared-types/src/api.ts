export interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
}

export interface APIResponse<T = any> {
    data?: T;
    error?: APIError;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

// Helper functions for dynamic endpoints
export const getCoffeeEndpoint = (id: number) => `/api/v1/coffees/${id}`;
export const getBrewLogEndpoint = (id: number) => `/api/v1/brewlogs/${id}`;
export const getUserBrewLogsEndpoint = (userId: number) => `/api/v1/users/${userId}/brewlogs`;

export const API_ENDPOINTS = {
    auth: {
        login: '/api/v1/auth/login',
        register: '/api/v1/users',
    },
    users: {
        me: '/api/v1/users/me',
        update: '/api/v1/users/me',
        delete: '/api/v1/users/me',
    },
    coffees: {
        list: '/api/v1/coffees',
        create: '/api/v1/coffees',
    },
    brewLogs: {
        list: '/api/v1/brewlogs',
        create: '/api/v1/brewlogs',
    },
    ai: {
        extractCoffee: '/api/v1/ai/extract-coffee',
        recommendation: '/api/v1/ai/recommendation',
    },
} as const;
