export interface Coffee {
    id: number;
    name: string;
    origin?: string;
    roaster?: string;
    description?: string;
    photoPath?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCoffeeRequest {
    name: string;
    origin?: string;
    roaster?: string;
    description?: string;
    photo?: File;
}

export interface UpdateCoffeeRequest {
    name?: string;
    origin?: string;
    roaster?: string;
    description?: string;
    photo?: File;
}

export interface CoffeeFilters {
    search?: string;
    origin?: string;
    roaster?: string;
    limit?: number;
    offset?: number;
}

export interface CoffeeListResponse {
    coffees: Coffee[];
    total: number;
    limit: number;
    offset: number;
}
