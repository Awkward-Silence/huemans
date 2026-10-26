import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// .env.test.local (git-ignored, for secrets such as API keys) wins over .env.test; a missing file is skipped.
config({ path: resolve(__dirname, '../../.env.test'), override: true, quiet: true });
config({ path: resolve(__dirname, '../../.env.test.local'), override: true, quiet: true });

// Booting the app must never call the real model: with a key configured, every suite would start a billed generation.
process.env.SENTENCE_TREE_ON_BOOT = 'false';
