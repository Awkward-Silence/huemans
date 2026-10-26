export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  openAi: {
    // Injected from the OPENAI_API_KEY GitHub secret where the API is deployed. Without it the sentence tree is unavailable (503) and web/ uses its bundled tree.
    apiKey: process.env.OPENAI_API_KEY || undefined,
    // gpt-4.1-mini and gpt-4.1 ignore the 3-option shape of the tree; gpt-5-mini follows it, kept fast with low effort.
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    reasoningEffort: (process.env.OPENAI_REASONING_EFFORT || 'low') as 'minimal' | 'low' | 'medium' | 'high',
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
