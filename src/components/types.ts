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
