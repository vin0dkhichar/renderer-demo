export type ValueType = string | number | boolean;

export interface TileItem {
    label: string;
    value: ValueType;
    type?: "string" | "number" | "boolean" | "date" | "aadhaar";
}

export interface BackendTile {
    id: string;
    title: string;
    layout: "single-column" | "two-column" | "three-column";
    items: TileItem[];
}


export type JsonSchemaConfig = {
    type: string;
    format?: string;
};

export const TYPE_SCHEMA_MAP: Record<string, JsonSchemaConfig> = {
    string: { type: "string" },
    number: { type: "number" },
    boolean: { type: "boolean" },
    date: { type: "string", format: "date" },

    aadhaar: {
        type: "string",
    },
};
