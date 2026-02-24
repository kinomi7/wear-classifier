import {useRef, useState, useEffect } from "react";
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

/* ---------------- 未分類 droppable ---------------- */

function UnclassifiedArea({ children }) {
    const { setNodeRef } = useDroppable({ id: "unclassified" });
    const scrollRef = useRef(null);
    const [maxScroll, setMaxScroll] = useState(0);
    const [scrollValue, setScrollValue] = useState(0);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const update = () => {
            setMaxScroll(el.scrollWidth - el.clientWidth);
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [children]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setScrollValue(el.scrollLeft);
    };

    const handleSliderChange = (e) => {
        const value = Number(e.target.value);
        setScrollValue(value);
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = value;
        }
    };

    return (
        <div style={{ width: "100%" }}>
            {/* 横スクロール本体 */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    border: "1px solid #ccc",
                    padding: "10px 0",
                    boxSizing: "border-box"
                }}
            >
                <div
                    ref={setNodeRef}
                    style={{
                        display: "flex",
                        gap: 12,
                        padding: "0 20px",
                        width: "max-content",
                        minHeight: 180
                    }}
                >
                    {children}
                </div>
            </div>

            {/* 🔥 スライドバー */}
            <input
                type="range"
                min="0"
                max={maxScroll}
                value={scrollValue}
                onChange={handleSliderChange}
                style={{
                    width: "100%",
                    marginTop: 8
                }}
            />
        </div>
    );
}


/* ---------------- main app ---------------- */

export default function App() {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState({});
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5
            }
        })
    );

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
    const unclassifiedCount = images.filter(url => !labels[url]).length;
const classifiedCount = Object.keys(labels).length;


    return (
        <DndContext
            sensors={sensors}
            onDragStart={(event) => {
                setActiveId(event.active.id);
            }}
            onDragEnd={(event) => {
                const { active, over } = event;

                if (!over) {
                    setActiveId(null);
                    return;
                }

                if (over.id === "unclassified") {
                    // 🔥 未分類へ戻す（labelsから削除）
                    setLabels(prev => {
                        const copy = { ...prev };
                        delete copy[active.id];
                        return copy;
                    });
                } else {
                    // 🔥 グリッドへ分類
                    setLabels(prev => ({
                        ...prev,
                        [active.id]: over.id
                    }));
                }

                setActiveId(null);
            }}
        >
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
                    <h2>未分類画像（{unclassifiedCount}枚）</h2>

                    <UnclassifiedArea>
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
                    </UnclassifiedArea>

                    <h2 style={{ marginTop: 40 }}>画像分類領域（{classifiedCount}枚）</h2>

                    <div
                        style={{
                            width: 1170,
                            margin: "0 auto",
                            padding: "60px 70px",
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
                        <button onClick={() => {
                            let csv = "image_url,category\n";
                            images.forEach(url => {
                                csv += `${url},${labels[url] || ""}\n`;
                            });

                            const blob = new Blob([csv], { type: "text/csv" });
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = "classified_outfits.csv";
                            a.click();
                        }}>
                            CSVとして保存
                        </button>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <img
                        src={activeId}
                        style={{
                            width: 160,
                            borderRadius: 6
                        }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
