export interface BrewLog {
    id: number;
    userId: number;
    coffeeId: number;
    brewMethod: string;
    coffeeWeight?: number;
    waterWeight?: number;
    grindSize?: string;
    waterTemperature?: number;
    brewTime?: number; // in seconds
    tastingNotes?: string;
    rating?: number; // 1-5
    createdAt: string;
    coffee?: Coffee; // Populated when fetching with coffee details
}

export interface CreateBrewLogRequest {
    coffeeId: number;
    brewMethod: string;
    coffeeWeight?: number;
    waterWeight?: number;
    grindSize?: string;
    waterTemperature?: number;
    brewTime?: number;
    tastingNotes?: string;
    rating?: number;
}

export interface UpdateBrewLogRequest {
    brewMethod?: string;
    coffeeWeight?: number;
    waterWeight?: number;
    grindSize?: string;
    waterTemperature?: number;
    brewTime?: number;
    tastingNotes?: string;
    rating?: number;
}

export interface BrewLogFilters {
    coffeeId?: number;
    userId?: number;
    brewMethod?: string;
    rating?: number;
    limit?: number;
    offset?: number;
}

export interface BrewLogListResponse {
    brewLogs: BrewLog[];
    total: number;
    limit: number;
    offset: number;
}

// Import Coffee type for the relationship
import { Coffee } from './coffee';
