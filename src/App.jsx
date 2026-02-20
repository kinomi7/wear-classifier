import { useEffect, useState } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable
} from "@dnd-kit/core";

const CATEGORIES = [
    "a", "b", "c", "d", "e",
    "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o"
];

/* ---------------- draggable image ---------------- */

function DraggableImage({ id, src, size = 160 }) {
    const { attributes, listeners, setNodeRef, transform } =
        useDraggable({ id });

    const style = {
        width: size,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        touchAction: "none", // ← スマホ必須
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

/* ---------------- droppable cell ---------------- */

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
                background: "#fafafa",
                boxSizing: "border-box",
                padding: 8
            }}
        >
            {children}
        </div>
    );
}

/* ---------------- main app ---------------- */

export default function App() {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState({});

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}wear_images_women.csv`)
            .then(res => res.text())
            .then(text => {
                const lines = text.trim().split("\n").slice(1);
                const data = lines.map(l => l.trim()).filter(Boolean);
                setImages(data);
            });
    }, []);

    if (images.length === 0) return <div>loading...</div>;

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over) {
            setLabels(prev => ({
                ...prev,
                [active.id]: over.id
            }));
        }
    };

    const exportCSV = () => {
        let csv = "image_url,category\n";
        images.forEach(url => {
            csv += `${url},${labels[url] || ""}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "classified_outfits.csv";
        a.click();
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: 1400,
                        padding: 20,
                        boxSizing: "border-box"
                    }}
                >
                    <h2>未分類画像</h2>

                    {/* 横スクロール画像エリア */}
                    <div
                        style={{
                            width: "100%",
                            overflowX: "auto",
                            overflowY: "hidden",
                            border: "1px solid #ccc",
                            padding: "10px 0",
                            boxSizing: "border-box"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                padding: "0 20px",
                                width: "max-content"
                            }}
                        >
                            {images
                                .filter(url => !labels[url])
                                .map(url => (
                                    <DraggableImage
                                        key={url}
                                        id={url}
                                        src={url}
                                        size={160}
                                    />
                                ))}
                        </div>
                    </div>

                    <h2 style={{ marginTop: 40 }}>分類グリッド</h2>

                    {/* 背景付きグリッド */}
                    <div
                        style={{
                            width: 1170,
                            margin: "0 auto",
                            padding: 20,
                            backgroundImage: `url(${import.meta.env.BASE_URL}grid-bg.png)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat"
                        }}
                    >
                        <div
                            style={{
                                width: 1150,
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gridTemplateRows: "repeat(3, 220px)",
                                gap: 15
                            }}
                        >
                            {CATEGORIES.map(cat => (
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

                    <div style={{ marginTop: 40, textAlign: "center" }}>
                        <button onClick={exportCSV}>CSVとして送信</button>
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
