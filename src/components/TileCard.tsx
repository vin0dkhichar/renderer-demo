import { Edit2 } from "lucide-react";
import { BackendTile } from "./types";
import { chunkIntoColumns } from "./chunkIntoColumns";

export function TileCard({ tile, onEdit }: { tile: BackendTile; onEdit: (tile: BackendTile) => void }) {
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
