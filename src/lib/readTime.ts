/**
 * Calculates estimated reading time based on content length.
 * Average adult reading speed: 200 words per minute.
 */
export function calcReadTime(content: string): string {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
}
