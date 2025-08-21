"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.validateEmail = exports.calculateRatio = exports.parseBrewTime = exports.formatBrewTime = exports.TemperatureUnit = exports.GRIND_SIZES = exports.Rating = exports.BrewMethod = void 0;
// Brew methods enum
var BrewMethod;
(function (BrewMethod) {
    BrewMethod["V60"] = "V60";
    BrewMethod["AEROPRESS"] = "Aeropress";
    BrewMethod["CHEMEX"] = "Chemex";
    BrewMethod["KALITA_WAVE"] = "Kalita Wave";
    BrewMethod["FRENCH_PRESS"] = "French Press";
    BrewMethod["ESPRESSO"] = "Espresso";
    BrewMethod["POUR_OVER"] = "Pour Over";
    BrewMethod["COLD_BREW"] = "Cold Brew";
    BrewMethod["OTHER"] = "Other";
})(BrewMethod || (exports.BrewMethod = BrewMethod = {}));
// Rating enum
var Rating;
(function (Rating) {
    Rating[Rating["ONE"] = 1] = "ONE";
    Rating[Rating["TWO"] = 2] = "TWO";
    Rating[Rating["THREE"] = 3] = "THREE";
    Rating[Rating["FOUR"] = 4] = "FOUR";
    Rating[Rating["FIVE"] = 5] = "FIVE";
})(Rating || (exports.Rating = Rating = {}));
// Grind size options
exports.GRIND_SIZES = [
    'Extra Fine',
    'Fine',
    'Medium-Fine',
    'Medium',
    'Medium-Coarse',
    'Coarse',
    'Extra Coarse',
];
// Temperature units
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit["CELSIUS"] = "C";
    TemperatureUnit["FAHRENHEIT"] = "F";
})(TemperatureUnit || (exports.TemperatureUnit = TemperatureUnit = {}));
// Time format utilities
const formatBrewTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
exports.formatBrewTime = formatBrewTime;
const parseBrewTime = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + (seconds || 0);
};
exports.parseBrewTime = parseBrewTime;
// Coffee ratio calculation
const calculateRatio = (coffeeWeight, waterWeight) => {
    if (coffeeWeight === 0)
        return 0;
    return waterWeight / coffeeWeight;
};
exports.calculateRatio = calculateRatio;
// Validation utilities
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    const errors = [];
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
exports.validatePassword = validatePassword;
