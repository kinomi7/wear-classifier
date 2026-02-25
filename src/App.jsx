import { useState, useEffect } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor
} from "@dnd-kit/core";

/* ---------------- モード判定 ---------------- */

const isMen = window.location.pathname.includes("men");

/* ---------------- モード別設定 ---------------- */

const CONFIG = isMen
    ? {
        mode: "men",
        csv: "wear_images_men.csv",
        categories: ["a", "b", "c", "d", "e", "f", "g", "h", "i"], // 3×3=9
        gridCols: 3
    }
    : {
        mode: "women",
        csv: "wear_images_women.csv",
        categories: [
            "a", "b", "c", "d", "e",
            "f", "g", "h", "i", "j",
            "k", "l", "m", "n", "o"
        ], // 5×3=15
        gridCols: 5
    };

const STORAGE_KEY = `labels_${CONFIG.mode}`;

/* ---------------- draggable ---------------- */

function DraggableImage({ id, src, size }) {
    const { attributes, listeners, setNodeRef, transform } =
        useDraggable({ id });

    const style = {
        width: size,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        touchAction: "none",
        borderRadius: 6,
        cursor: "grab"
    };

    return (
        <img
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            src={src}
            style={style}
        />
    );
}

/* ---------------- droppable ---------------- */

function DroppableCell({ id, children }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: 220,
                height: 220,
                border: "2px solid #888",
                overflowY: "auto",
                padding: 8,
                background: "#fafafa"
            }}
        >
            {children}
        </div>
    );
}

/* ---------------- 未分類 ---------------- */

function UnclassifiedArea({ children }) {
    const { setNodeRef } = useDroppable({ id: "unclassified" });

    return (
        <div style={{ overflowX: "auto", padding: "10px 0" }}>
            <div
                ref={setNodeRef}
                style={{
                    display: "flex",
                    gap: 12,
                    padding: "0 20px",
                    width: "max-content"
                }}
            >
                {children}
            </div>
        </div>
    );
}

/* ---------------- main ---------------- */

export default function App() {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState({});
    const [activeId, setActiveId] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 5 }
        })
    );

    /* -------- CSV読み込み -------- */

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}${CONFIG.csv}`)
            .then(res => res.text())
            .then(text => {
                const lines = text.trim().split("\n").slice(1);

                const data = lines
                    .map(l => l.trim())
                    .filter(Boolean)
                    .map(path => `${import.meta.env.BASE_URL}${path}`);

                setImages(data);
            });
    }, []);

    /* -------- 復元 -------- */

    useEffect(() => {
        if (images.length === 0) return;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            const filtered = {};

            images.forEach(url => {
                if (parsed[url]) filtered[url] = parsed[url];
            });

            setLabels(filtered);
        }

        setLoaded(true);
    }, [images]);

    /* -------- 保存 -------- */

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    }, [labels, loaded]);

    if (images.length === 0) return <div>loading...</div>;

    const unclassified = images.filter(url => !labels[url]);
    const classified = Object.keys(labels).length;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={e => setActiveId(e.active.id)}
            onDragEnd={e => {
                const { active, over } = e;
                if (!over) return setActiveId(null);

                if (over.id === "unclassified") {
                    setLabels(prev => {
                        const copy = { ...prev };
                        delete copy[active.id];
                        return copy;
                    });
                } else {
                    setLabels(prev => ({
                        ...prev,
                        [active.id]: over.id
                    }));
                }

                setActiveId(null);
            }}
        >
            <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
                <h2>未分類（{unclassified.length}）</h2>

                <UnclassifiedArea>
                    {unclassified.map(url => (
                        <DraggableImage
                            key={url}
                            id={url}
                            src={url}
                            size={160}
                        />
                    ))}
                </UnclassifiedArea>

                <h2 style={{ marginTop: 40 }}>
                    分類済み（{classified}）
                </h2>

                <div style={{ marginTop: 20, padding: 40 }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${CONFIG.gridCols}, 1fr)`,
                            gridAutoRows: "220px",
                            gap: 15,
                            justifyItems: "center"
                        }}
                    >
                        {CONFIG.categories.map(cat => (
                            <DroppableCell key={cat} id={cat}>
                                {Object.entries(labels)
                                    .filter(([_, c]) => c === cat)
                                    .map(([url]) => (
                                        <DraggableImage
                                            key={url}
                                            id={url}
                                            src={url}
                                            size={70}
                                        />
                                    ))}
                            </DroppableCell>
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId && (
                    <img src={activeId} style={{ width: 160 }} />
                )}
            </DragOverlay>
        </DndContext>
    );
}
