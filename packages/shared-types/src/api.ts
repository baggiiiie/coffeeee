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

export interface APIEndpoints {
    // Auth endpoints
    auth: {
        login: '/api/v1/auth/login';
        register: '/api/v1/users';
    };

    // User endpoints
    users: {
        me: '/api/v1/users/me';
        update: '/api/v1/users/me';
        delete: '/api/v1/users/me';
    };

    // Coffee endpoints
    coffees: {
        list: '/api/v1/coffees';
        create: '/api/v1/coffees';
        get: (id: number) => `/api/v1/coffees/${id}`;
        update: (id: number) => `/api/v1/coffees/${id}`;
        delete: (id: number) => `/api/v1/coffees/${id}`;
    };

    // Brew log endpoints
    brewLogs: {
        list: '/api/v1/brewlogs';
        create: '/api/v1/brewlogs';
        get: (id: number) => `/api/v1/brewlogs/${id}`;
        update: (id: number) => `/api/v1/brewlogs/${id}`;
        delete: (id: number) => `/api/v1/brewlogs/${id}`;
        byUser: (userId: number) => `/api/v1/users/${userId}/brewlogs`;
    };

    // AI endpoints
    ai: {
        extractCoffee: '/api/v1/ai/extract-coffee';
        recommendation: '/api/v1/ai/recommendation';
    };
}

export const API_ENDPOINTS: APIEndpoints = {
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
        get: (id: number) => `/api/v1/coffees/${id}`,
        update: (id: number) => `/api/v1/coffees/${id}`,
        delete: (id: number) => `/api/v1/coffees/${id}`,
    },
    brewLogs: {
        list: '/api/v1/brewlogs',
        create: '/api/v1/brewlogs',
        get: (id: number) => `/api/v1/brewlogs/${id}`,
        update: (id: number) => `/api/v1/brewlogs/${id}`,
        delete: (id: number) => `/api/v1/brewlogs/${id}`,
        byUser: (userId: number) => `/api/v1/users/${userId}/brewlogs`,
    },
    ai: {
        extractCoffee: '/api/v1/ai/extract-coffee',
        recommendation: '/api/v1/ai/recommendation',
    },
};
