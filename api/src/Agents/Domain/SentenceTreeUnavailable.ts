/** No sentence tree could be generated (no model configured, provider error, or unusable output). */
export class SentenceTreeUnavailable extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}
