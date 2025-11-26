"use client";

import { useEffect, useMemo, useState } from "react";
import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";
import { Save, X } from "lucide-react";
import { ThemeProvider } from "@mui/material/styles";
import { BackendTile } from "./types";
import { tileToJsonForms } from "./tileToJsonForms";
import { jsonFormsTheme } from "./jsonFormsTheme";
import AadhaarRenderer from "./Aadhaar";
import aadhaarTester from "./aadhaarTester";

const renderers = [
    ...materialRenderers,
    { tester: aadhaarTester, renderer: AadhaarRenderer },
];

export function TileEditorModal({
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
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
                    <ThemeProvider theme={jsonFormsTheme}>
                        <JsonForms
                            schema={jsonSchema}
                            uischema={uiSchema}
                            data={formData}
                            renderers={renderers}
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
