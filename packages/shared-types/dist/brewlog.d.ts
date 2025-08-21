export interface BrewLog {
    id: number;
    userId: number;
    coffeeId: number;
    brewMethod: string;
    coffeeWeight?: number;
    waterWeight?: number;
    grindSize?: string;
    waterTemperature?: number;
    brewTime?: number;
    tastingNotes?: string;
    rating?: number;
    createdAt: string;
    coffee?: Coffee;
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
import { Coffee } from './coffee';
