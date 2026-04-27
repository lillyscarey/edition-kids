// Shared text helpers used by both the web ArticleCard and the PDF renderer.

/**
 * Truncate body text to at most `max` sentences, splitting on . ! ? followed
 * by whitespace or end-of-string. Returns the original (trimmed) text if no
 * sentence boundaries are found.
 */
export function truncateToSentences(text: string, max = 4): string {
  const sentences = text.match(/[^.!?]*[.!?]+(\s|$)/g) ?? [text]
  return sentences.slice(0, max).join('').trim()
}
