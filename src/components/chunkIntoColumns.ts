export function chunkIntoColumns<T>(
    items: T[],
    maxPerColumn: number,
    columns: number
): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += maxPerColumn) {
        chunks.push(items.slice(i, i + maxPerColumn));
    }
    return chunks.slice(0, columns);
}
