# External APIs

This section details the third-party APIs that our application will integrate with.

### AI Service (for Tasting Notes & Brewing Suggestions)

We will integrate with external AI models to provide users with suggestions and insights. This will be handled by an `AIService` client in the backend, which will be designed with a provider-agnostic interface to allow for flexibility.

**Supported Providers:**

1.  **OpenAI ChatGPT**
    *   **API Endpoint:** `https://api.openai.com/v1/chat/completions`
    *   **Purpose:** To generate creative tasting notes, suggest brewing parameters, and provide interesting facts about a coffee's origin.
    *   **Authentication:** API Key sent in the `Authorization` header.

2.  **Google Gemini**
    *   **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
    *   **Purpose:** Similar to OpenAI, it will be used to generate tasting notes and other coffee-related content.
    *   **Authentication:** API Key sent as a query parameter.

**Integration Strategy:**
The backend's `AIService` will contain a common interface for interacting with these AI providers. The specific provider to be used for a given request can be determined by configuration or user choice. This approach allows us to easily add more providers in the future or switch between them as needed.

---