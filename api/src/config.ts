export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  anthropic: {
    // Injected from the ANTHROPIC_API_KEY GitHub secret where the API is deployed. Without it the sentence tree is unavailable (503) and web/ uses its bundled tree.
    apiKey: process.env.ANTHROPIC_API_KEY || undefined,
    model: process.env.ANTHROPIC_MODEL || 'claude-opus-5-5',
  },
  // Generate the sentence tree at boot, so the first attendee doesn't wait for the model.
  growSentenceTreeOnBoot: process.env.SENTENCE_TREE_ON_BOOT !== 'false',
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
