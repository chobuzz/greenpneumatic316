
/**
 * Generates a URL-friendly slug from a given string.
 * Supports Korean characters and replaces spaces with hyphens.
 */
export function generateSlug(text: string): string {
    if (!text) return "id-" + Math.random().toString(36).substring(2, 9);

    const slug = text
        .toString()
        .toLowerCase()
        .trim()
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove special characters that are not alphanumeric or Korean characters or hyphens
        // Allows: English (a-z), Numbers (0-9), Korean (ㄱ-ㅎ, ㅏ-ㅣ, 가-힣), and hyphens
        .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣-]/g, '')
        // Replace multiple hyphens with a single hyphen
        .replace(/-+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '');

    return slug || "id-" + Math.random().toString(36).substring(2, 9);
}
