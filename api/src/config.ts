export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jev: {
    // Jev (TypeSafe's System One model) weighs the "I ..." sentence's traits. From the JEV_API_KEY GitHub secret where
    // the API is deployed; without it the sentence adds no traits and the multiple-choice answers decide alone.
    apiKey: process.env.JEV_API_KEY || undefined,
    model: process.env.JEV_MODEL || 'jev-latest',
    url: process.env.JEV_URL || 'https://api.typesafe.ai/v1/systemone',
    // Jev answers in 70-500 ms; past this the sentence is skipped so submitting never hangs.
    timeoutMs: Number(process.env.JEV_TIMEOUT_MS || 1500),
  },
};
