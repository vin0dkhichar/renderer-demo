import { BackendTile } from "./types";

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export function tileToJsonForms(tile: BackendTile) {
    const properties: Record<string, any> = {};
    const elements: any[] = [];
    const initialData: Record<string, any> = {};

    tile.items.forEach((item, i) => {
        const key = item.label.replace(/\s+/g, "_").toLowerCase() + "_" + i;

        if (item.type === "aadhaar") {
            properties[key] = {
                type: "string",
                title: item.label,
            };
        } else {
            properties[key] = {
                type: item.type === "date" ? "string" : item.type || "string",
                title: item.label,
                ...(item.type === "date" ? { format: "date" } : {}),
            };
        }

        elements.push({
            type: "Control",
            scope: "#/properties/" + key,
        });

        initialData[key] = item.value;
    });

    const rows = chunkArray(elements, 3);

    const uiSchema = {
        type: "VerticalLayout",
        elements: rows.map((row) => ({
            type: "HorizontalLayout",
            elements: row,
        })),
    };

    return {
        jsonSchema: { type: "object", properties },
        uiSchema,
        initialData,
    };
}
