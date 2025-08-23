// Shared AI-related types for both interactive tasting (Story 2.4)
// and brew recommendation (Story 3.2)

// Interactive tasting assistant (Story 2.4)
export type AIOption = { label: string; value: string };
export type AIQuestion = {
    questionId: string;
    text: string;
    options: AIOption[];
    hint?: string;
};

export type AIAnswer = { id: string; value: string };
export type AIContext = { brewMethod?: string };

export type AIQuestionRequest = { answers: AIAnswer[]; context?: AIContext };

// Brew recommendation (Story 3.2)
export type BrewRecommendationRequest = {
    brewLog: Partial<import('./brewlog').CreateBrewLogRequest> & { brewMethod?: string };
    goal: string;
};

export type BrewRecommendationResponse = {
    change: { variable: string; delta: string };
    explanation: string;
};

// Union response shape for single endpoint supporting both stories
export type AIRecommendationResponse = AIQuestion | BrewRecommendationResponse;

