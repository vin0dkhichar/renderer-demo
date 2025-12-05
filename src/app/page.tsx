"use client";
import { useMemo, useState } from "react";
import { X, Edit2, Save } from "lucide-react";

type ValueType = string | number | boolean | Date;

interface KeyValueItem {
    label: string;
    type: "string" | "number" | "boolean" | "date";
    value: ValueType;
}

interface Panel {
    items: KeyValueItem[];
}

type LayoutType = "single-column" | "two-column" | "three-column";

interface PanelTileSchema {
    title: string;
    layout: LayoutType;
    panels: Panel[];
}

const layoutPanelCountMap: Record<LayoutType, number> = {
    "single-column": 1,
    "two-column": 2,
    "three-column": 3,
};

const defaultNewItem: KeyValueItem = { label: "", type: "string", value: "" };

function formatValue(value: ValueType, type: KeyValueItem["type"]): string {
    if (type === "date") {
        if (value instanceof Date) return value.toLocaleDateString();

        if (typeof value === "string" || typeof value === "number") {
            return new Date(value).toLocaleDateString();
        }

        return "";
    }
    if (type === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function parseValueByType(value: string, type: KeyValueItem["type"]): ValueType {
    switch (type) {
        case "number": {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        }
        case "boolean":
            return value === "true";
        case "date":
            return value;
        default:
            return value;
    }
}

function validateSchema(schema: PanelTileSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const expectedPanels = layoutPanelCountMap[schema.layout];

    if (!schema.title || schema.title.trim() === "") {
        errors.push("Title is required");
    }

    if (schema.panels.length !== expectedPanels) {
        errors.push(
            `Layout "${schema.layout}" requires ${expectedPanels} panel(s), but ${schema.panels.length} provided`
        );
    }

    schema.panels.forEach((panel, pIndex) => {
        if (!panel.items || panel.items.length === 0) {
            errors.push(`Panel ${pIndex + 1} must have at least one item`);
        }
        panel.items.forEach((item, iIndex) => {
            if (!item.label || item.label.trim() === "") {
                errors.push(`Panel ${pIndex + 1}, Item ${iIndex + 1}: Label is required`);
            }
            if (!item.type) {
                errors.push(`Panel ${pIndex + 1}, Item ${iIndex + 1}: Type is required`);
            }
        });
    });

    return { valid: errors.length === 0, errors };
}

function SchemaEditor({
    schema,
    onSave,
    onClose,
}: {
    schema: PanelTileSchema;
    onSave: (schema: PanelTileSchema) => void;
    onClose: () => void;
}) {
    const [editedSchema, setEditedSchema] = useState<PanelTileSchema>(JSON.parse(JSON.stringify(schema)));
    const [errors, setErrors] = useState<string[]>([]);

    const handleTitleChange = (title: string) => {
        setEditedSchema((prev) => ({ ...prev, title }));
    };

    const handleLayoutChange = (layout: LayoutType) => {
        const expectedPanels = layoutPanelCountMap[layout];
        const currentPanels = [...editedSchema.panels];

        if (currentPanels.length < expectedPanels) {
            while (currentPanels.length < expectedPanels) {
                currentPanels.push({ items: [defaultNewItem] });
            }
        } else if (currentPanels.length > expectedPanels) {
            currentPanels.splice(expectedPanels);
        }

        setEditedSchema((prev) => ({ ...prev, layout, panels: currentPanels }));
    };

    const handleItemChange = (
        panelIndex: number,
        itemIndex: number,
        field: "label" | "value",
        value: string
    ) => {
        setEditedSchema((prev) => {
            const newPanels = [...prev.panels];
            const currentItem = newPanels[panelIndex].items[itemIndex];
            const parsedValue = field === "value" ? parseValueByType(value, currentItem.type) : currentItem.value;

            newPanels[panelIndex] = {
                ...newPanels[panelIndex],
                items: newPanels[panelIndex].items.map((item, idx) => {
                    if (idx === itemIndex) {
                        if (field === "label") {
                            return { ...item, label: value };
                        } else {
                            return { ...item, value: parsedValue };
                        }
                    }
                    return item;
                }),
            };

            return { ...prev, panels: newPanels };
        });
    };

    const handleSave = () => {
        const validation = validateSchema(editedSchema);
        if (validation.valid) {
            onSave(editedSchema);
            onClose();
        } else {
            setErrors(validation.errors);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">Edit Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="text-red-800 font-semibold mb-2">Validation Errors:</h4>
                            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={editedSchema.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    <div className="space-y-4">
                        {editedSchema.panels.map((panel, panelIndex) => (
                            <div key={panelIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="space-y-3">
                                    {panel.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="bg-white p-3 rounded">
                                            <div className="grid grid-cols-12 gap-2 items-start">
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        value={item.label}
                                                        onChange={(e) => handleItemChange(panelIndex, itemIndex, "label", e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-9">
                                                    {item.type === "boolean" ? (
                                                        <select
                                                            value={String(item.value)}
                                                            onChange={(e) => handleItemChange(panelIndex, itemIndex, "value", e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                                                            required
                                                        >
                                                            <option value="true">True</option>
                                                            <option value="false">False</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={
                                                                item.type === "number"
                                                                    ? "number"
                                                                    : item.type === "date"
                                                                        ? "date"
                                                                        : "text"
                                                            }
                                                            value={String(item.value)}
                                                            onChange={(e) => handleItemChange(panelIndex, itemIndex, "value", e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black-700"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function PanelTile({
    schema,
    onEdit,
}: {
    schema: PanelTileSchema;
    onEdit: () => void;
}) {
    const gridCols =
        schema.layout === "three-column"
            ? "grid-cols-3"
            : schema.layout === "two-column"
                ? "grid-cols-2"
                : "grid-cols-1";

    return (
        <div className="bg-white p-5 rounded-xl shadow h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-black font-bold">{schema.title}</h2>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                >
                    <Edit2 size={16} /> Edit Details
                </button>
            </div>
            <div className={`grid ${gridCols} gap-4`}>
                {schema.panels.map((panel, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-gray-50">
                        {panel.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm py-1">
                                <span className="font-medium text-gray-900">{item.label}</span>
                                <span className="text-gray-900">{formatValue(item.value, item.type)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PanelRenderer({
    schemaList,
    onUpdate,
}: {
    schemaList: PanelTileSchema[];
    onUpdate: (index: number, schema: PanelTileSchema) => void;
}) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const rows = useMemo(() => {
        const result: Array<{ tiles: PanelTileSchema[], indices: number[] }> = [];
        let buffer: PanelTileSchema[] = [];
        let bufferIndices: number[] = [];

        schemaList.forEach((tile, index) => {
            if (tile.layout === "three-column") {
                if (buffer.length) {
                    result.push({ tiles: buffer, indices: bufferIndices });
                    buffer = [];
                    bufferIndices = [];
                }
                result.push({ tiles: [tile], indices: [index] });
            } else if (tile.layout === "two-column") {
                if (buffer.length && buffer[0].layout === "single-column") {
                    result.push({ tiles: buffer, indices: bufferIndices });
                    buffer = [];
                    bufferIndices = [];
                }

                buffer.push(tile);
                bufferIndices.push(index);

                if (buffer.length === 2) {
                    result.push({ tiles: buffer, indices: bufferIndices });
                    buffer = [];
                    bufferIndices = [];
                }
            } else {
                if (buffer.length && buffer[0].layout === "two-column") {
                    result.push({ tiles: buffer, indices: bufferIndices });
                    buffer = [];
                    bufferIndices = [];
                }

                buffer.push(tile);
                bufferIndices.push(index);

                if (buffer.length === 3) {
                    result.push({ tiles: buffer, indices: bufferIndices });
                    buffer = [];
                    bufferIndices = [];
                }
            }
        });

        if (buffer.length) {
            result.push({ tiles: buffer, indices: bufferIndices });
        }

        return result;
    }, [schemaList]);

    return (
        <>
            <div className="space-y-6">
                {rows.map((row, rowIndex) => {
                    const isThreeColumn = row.tiles.length === 1 && row.tiles[0].layout === "three-column";
                    const isTwoTwoColumns = row.tiles.length === 2 &&
                        row.tiles.every(t => t.layout === "two-column");
                    const isSingleColumns = row.tiles.every(t => t.layout === "single-column");

                    return (
                        <div
                            key={rowIndex}
                            className={`grid gap-6 ${isThreeColumn
                                ? "grid-cols-1"
                                : isTwoTwoColumns
                                    ? "grid-cols-2"
                                    : isSingleColumns
                                        ? "grid-cols-3"
                                        : "grid-cols-3"
                                }`}
                        >
                            {row.tiles.map((schema, tileIdx) => {
                                const currentIndex = row.indices[tileIdx];

                                return (
                                    <div key={currentIndex} className="col-span-1">
                                        <PanelTile
                                            schema={schema}
                                            onEdit={() => setEditingIndex(currentIndex)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            {editingIndex !== null && (
                <SchemaEditor
                    schema={schemaList[editingIndex]}
                    onSave={(updatedSchema) => {
                        onUpdate(editingIndex, updatedSchema);
                        setEditingIndex(null);
                    }}
                    onClose={() => setEditingIndex(null)}
                />
            )}
        </>
    );
}

const exampleData: PanelTileSchema[] = [
    {
        title: "User Profile",
        layout: "three-column",
        panels: [
            {
                items: [
                    { label: "First Name", type: "string", value: "Alice" },
                    { label: "Last Name", type: "string", value: "Johnson" },
                    { label: "Age", type: "number", value: 28 },
                ],
            },
            {
                items: [
                    { label: "Gender", type: "string", value: "Female" },
                    { label: "Married", type: "boolean", value: false },
                    { label: "Birth Date", type: "date", value: "1995-04-12" },
                ],
            },
            {
                items: [
                    { label: "Email", type: "string", value: "alice@example.com" },
                    { label: "Phone", type: "string", value: "555-1234" },
                    { label: "Address", type: "string", value: "123 Main St" },
                ],
            },
        ],
    },
    {
        title: "Sales Data Q1",
        layout: "two-column",
        panels: [
            {
                items: [
                    { label: "Revenue", type: "number", value: 125000 },
                    { label: "Units Sold", type: "number", value: 450 },
                    { label: "Growth", type: "string", value: "+15%" },
                ],
            },
            {
                items: [
                    { label: "Customers", type: "number", value: 234 },
                    { label: "Avg Order", type: "number", value: 535 },
                    { label: "Returns", type: "number", value: 12 },
                ],
            },
        ],
    },
    {
        title: "Sales Data Q2",
        layout: "two-column",
        panels: [
            {
                items: [
                    { label: "Revenue", type: "number", value: 148000 },
                    { label: "Units Sold", type: "number", value: 520 },
                    { label: "Growth", type: "string", value: "+18%" },
                ],
            },
            {
                items: [
                    { label: "Customers", type: "number", value: 289 },
                    { label: "Avg Order", type: "number", value: 512 },
                    { label: "Returns", type: "number", value: 8 },
                ],
            },
        ],
    },
    {
        title: "Location Info",
        layout: "single-column",
        panels: [
            {
                items: [
                    { label: "City", type: "string", value: "Metropolis" },
                    { label: "State", type: "string", value: "NY" },
                    { label: "Zip Code", type: "string", value: "10001" },
                ],
            },
        ],
    },
    {
        title: "Contact",
        layout: "single-column",
        panels: [
            {
                items: [
                    { label: "Office", type: "string", value: "Main HQ" },
                    { label: "Floor", type: "number", value: 5 },
                    { label: "Extension", type: "string", value: "x234" },
                ],
            },
        ],
    },
    {
        title: "Status",
        layout: "single-column",
        panels: [
            {
                items: [
                    { label: "Active", type: "boolean", value: true },
                    { label: "Since", type: "date", value: "2020-01-15" },
                    { label: "Level", type: "string", value: "Premium" },
                ],
            },
        ],
    },

    {
        title: "Financial Overview",
        layout: "three-column",
        panels: [
            {
                items: [
                    { label: "Assets", type: "number", value: 500000 },
                    { label: "Liabilities", type: "number", value: 150000 },
                    { label: "Net Worth", type: "number", value: 350000 },
                ],
            },
            {
                items: [
                    { label: "Income", type: "number", value: 85000 },
                    { label: "Expenses", type: "number", value: 45000 },
                    { label: "Savings", type: "number", value: 40000 },
                ],
            },
            {
                items: [
                    { label: "Investments", type: "number", value: 120000 },
                    { label: "Returns", type: "string", value: "+12.5%" },
                    { label: "Portfolio", type: "string", value: "Diversified" },
                ],
            },
        ],
    }
];

export default function App() {
    const [panelData, setPanelData] = useState<PanelTileSchema[]>(exampleData);

    const handleUpdate = (index: number, updatedSchema: PanelTileSchema) => {
        setPanelData((prev) => {
            const newData = [...prev];
            newData[index] = updatedSchema;
            return newData;
        });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-10">
            <PanelRenderer schemaList={panelData} onUpdate={handleUpdate} />
        </main>
    );
}
