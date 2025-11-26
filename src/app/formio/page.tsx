"use client";

import { useEffect, useMemo, useState } from "react";
import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";
import { JsonSchema } from "@jsonforms/core";
import { Save, X, Edit2 } from "lucide-react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const jsonFormsTheme = createTheme({
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#000",
                    fontWeight: 500,
                    "&.Mui-focused": {
                        color: "#000"
                    },
                    "&.Mui-disabled": {
                        color: "#000"
                    }
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#000"
                }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    marginBottom: 20,
                    color: "#000"
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "#000"
                }
            }
        }
    }
});


type ValueType = string | number | boolean;

interface BackendTile {
    id: string;
    title: string;
    layout: "single-column" | "two-column" | "three-column";
    items: { label: string; value: ValueType; type?: "string" | "number" | "boolean" | "date" }[];
}

function fetchTilesMock(): Promise<BackendTile[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: "profile",
                    title: "User Profile",
                    layout: "three-column",
                    items: [
                        { label: "First Name", value: "Alice", type: "string" },
                        { label: "Last Name", value: "Johnson", type: "string" },
                        { label: "Age", value: 28, type: "number" },
                        { label: "Gender", value: "Female", type: "string" },
                        { label: "Married", value: false, type: "boolean" },
                        { label: "Birth Date", value: "1995-04-12", type: "date" },
                        { label: "Email", value: "alice@example.com", type: "string" },
                        { label: "Phone", value: "555-1234", type: "string" },
                        { label: "Address", value: "123 Main St", type: "string" },
                    ],
                },
                {
                    id: "sales_q1",
                    title: "Sales Data Q1",
                    layout: "two-column",
                    items: [
                        { label: "Revenue", value: 125000, type: "number" },
                        { label: "Units Sold", value: 450, type: "number" },
                        { label: "Growth", value: "+15%", type: "string" },
                        { label: "Customers", value: 234, type: "number" },
                        { label: "Avg Order", value: 535, type: "number" },
                        { label: "Returns", value: 12, type: "number" },
                    ],
                },
                {
                    id: "location",
                    title: "Location Info",
                    layout: "single-column",
                    items: [
                        { label: "City", value: "Metropolis", type: "string" },
                        { label: "State", value: "NY", type: "string" },
                        { label: "Zip Code", value: "10001", type: "string" },
                    ],
                },
            ]);
        }, 300);
    });
}


function chunkIntoColumns<T>(items: T[], maxPerColumn: number, columns: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += maxPerColumn) {
        chunks.push(items.slice(i, i + maxPerColumn));
    }
    return chunks.slice(0, columns);
}


function tileToJsonForms(tile: BackendTile) {
    const properties: Record<string, any> = {};
    const elements: any[] = [];

    tile.items.forEach((item, i) => {
        const key = item.label.replace(/\s+/g, "_").toLowerCase() + "_" + i;
        properties[key] = {
            type: item.type === "date" ? "string" : item.type || "string",
            title: item.label,
            ...(item.type === "date" ? { format: "date" } : {}),
        };
        // elements.push({ type: "Control", scope: "#/properties/" + key });
        elements.push({
            type: "Control",
            scope: "#/properties/" + key,
            options: {
                classNames: "bg-gray-900 rounded-lg p-2"
            }
        });
    });

    const jsonSchema: JsonSchema = {
        type: "object",
        properties,
    };

    const uiSchema = {
        type: "VerticalLayout",
        elements,
    };

    const initialData: Record<string, any> = {};
    tile.items.forEach((item, i) => {
        const key = item.label.replace(/\s+/g, "_").toLowerCase() + "_" + i;
        initialData[key] = item.value;
    });

    return { jsonSchema, uiSchema, initialData };
}


function TileEditorModal({
    tile,
    onClose,
    onSave,
}: {
    tile: BackendTile;
    onClose: () => void;
    onSave: (updated: BackendTile) => void;
}) {
    const { jsonSchema, uiSchema, initialData } = useMemo(() => tileToJsonForms(tile), [tile]);
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => setFormData(initialData), [initialData]);

    const validate = (data: Record<string, any>) => {
        return [];
    };

    const handleSave = () => {
        const newErrors = validate(formData);
        if (newErrors.length) {
            setErrors(newErrors);
            return;
        }

        const updatedItems = tile.items.map((item, i) => {
            const key = item.label.replace(/\s+/g, "_").toLowerCase() + "_" + i;
            return { ...item, value: formData[key] };
        });

        onSave({ ...tile, items: updatedItems });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6 overflow-auto">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h4 className="text-lg text-black font-semibold">{`Edit: ${tile.title}`}</h4>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border rounded">
                            <div className="font-semibold text-red-700">Validation Errors</div>
                            <ul className="text-sm text-red-700 mt-2 space-y-1">
                                {errors.map((e, i) => (
                                    <li key={i}>{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* <JsonForms
                        schema={jsonSchema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={materialRenderers}
                        cells={materialCells}
                        onChange={({ data }) => setFormData(data)}
                    /> */}
                    <ThemeProvider theme={jsonFormsTheme}>
                        <JsonForms
                            schema={jsonSchema}
                            uischema={uiSchema}
                            data={formData}
                            renderers={materialRenderers}
                            cells={materialCells}
                            onChange={({ data }) => setFormData(data)}
                        />
                    </ThemeProvider>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 border rounded text-white bg-black">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded"
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TileCard({ tile, onEdit }: { tile: BackendTile; onEdit: (tile: BackendTile) => void }) {
    const columns = tile.layout === "three-column" ? 3 : tile.layout === "two-column" ? 2 : 1;
    const colClass = columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1";

    const groupedItems = chunkIntoColumns(tile.items, 3, columns);

    const widthClass =
        tile.layout === "three-column"
            ? "w-full"
            : tile.layout === "two-column"
                ? "w-2/3"
                : "w-1/3";

    return (
        <div
            className={`${widthClass} bg-white rounded-xl shadow p-5 flex flex-col h-full`}
            style={{ minWidth: 300 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-black text-2xl">{tile.title}</h3>
                <button
                    onClick={() => onEdit(tile)}
                    className="text-white bg-black px-3 py-1.5 rounded flex items-center gap-2 text-sm"
                >
                    <Edit2 size={14} /> Edit Details
                </button>
            </div>

            <div className={`grid ${colClass} gap-4`}>
                {groupedItems.map((col, colIdx) => (
                    <div key={colIdx} className="space-y-2">
                        {col.map(({ label, value }, i) => (
                            <div key={i} className="flex justify-between">
                                <span className="text-sm text-gray-600">{label}</span>
                                <span className="text-sm font-medium text-gray-900 truncate">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Page() {
    const [tiles, setTiles] = useState<BackendTile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTile, setEditingTile] = useState<BackendTile | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchTilesMock().then((data) => {
            setTiles(data);
            setLoading(false);
        });
    }, []);

    const handleEdit = (tile: BackendTile) => {
        setEditingTile(tile);
    };

    const handleSaveTile = (updated: BackendTile) => {
        setTiles((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-gray-600">Loading tiles...</div>
                ) : (
                    <div className="flex flex-wrap gap-6">
                        {tiles.map((tile) => (
                            <TileCard key={tile.id} tile={tile} onEdit={handleEdit} />
                        ))}
                    </div>
                )}

                {editingTile && (
                    <TileEditorModal
                        tile={editingTile}
                        onClose={() => setEditingTile(null)}
                        onSave={handleSaveTile}
                    />
                )}
            </div>
        </main>
    );
}
