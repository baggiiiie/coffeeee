"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.getUserBrewLogsEndpoint = exports.getBrewLogEndpoint = exports.getCoffeeEndpoint = void 0;
// Helper functions for dynamic endpoints
const getCoffeeEndpoint = (id) => `/api/v1/coffees/${id}`;
exports.getCoffeeEndpoint = getCoffeeEndpoint;
const getBrewLogEndpoint = (id) => `/api/v1/brewlogs/${id}`;
exports.getBrewLogEndpoint = getBrewLogEndpoint;
const getUserBrewLogsEndpoint = (userId) => `/api/v1/users/${userId}/brewlogs`;
exports.getUserBrewLogsEndpoint = getUserBrewLogsEndpoint;
exports.API_ENDPOINTS = {
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
};
