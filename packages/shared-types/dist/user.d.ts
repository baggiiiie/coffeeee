export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}
export interface UpdateUserRequest {
    username?: string;
    email?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: User;
}
export interface AuthContext {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: CreateUserRequest) => Promise<void>;
}
