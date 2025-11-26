"use client";

import { useEffect, useState } from "react";
import { BackendTile } from "@/components/types";
import { fetchTilesMock } from "@/components/fetchTilesMock";
import { TileCard } from "@/components/TileCard";
import { TileEditorModal } from "@/components/TileEditorModal";


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
