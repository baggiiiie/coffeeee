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
export declare const getCoffeeEndpoint: (id: number) => string;
export declare const getBrewLogEndpoint: (id: number) => string;
export declare const getUserBrewLogsEndpoint: (userId: number) => string;
export declare const API_ENDPOINTS: {
    readonly auth: {
        readonly login: "/api/v1/auth/login";
        readonly register: "/api/v1/users";
    };
    readonly users: {
        readonly me: "/api/v1/users/me";
        readonly update: "/api/v1/users/me";
        readonly delete: "/api/v1/users/me";
    };
    readonly coffees: {
        readonly list: "/api/v1/coffees";
        readonly create: "/api/v1/coffees";
    };
    readonly brewLogs: {
        readonly list: "/api/v1/brewlogs";
        readonly create: "/api/v1/brewlogs";
    };
    readonly ai: {
        readonly extractCoffee: "/api/v1/ai/extract-coffee";
        readonly recommendation: "/api/v1/ai/recommendation";
    };
};
