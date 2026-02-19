import { useEffect, useState } from "react";

    const CATEGORIES = [
    "a","b","c","d","e",
    "f","g","h","i","j",
    "k","l","m","n","o"
    ];

    export default function App() {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState({});
    const [dragged, setDragged] = useState(null);

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

    const handleDrop = (cat) => {
        if (dragged) {
        setLabels(prev => ({ ...prev, [dragged]: cat }));
        setDragged(null);
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
        maxWidth: 1400,   // ← 最大幅だけ制限
        padding: "20px",
        boxSizing: "border-box"
      }}
    >

            <h2>未分類画像</h2>

            <h2>未分類画像</h2>

            <div
            style={{
                width: "100%",          // ← 親に合わせる
                maxWidth: "100%",       // ← はみ出し防止
                overflowX: "auto",      // ← 横スクロールはここだけ
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
                    width: "max-content"  // ← 画像数に応じて横伸び
                    }}
                >
                    {images
                    .filter(url => !labels[url])
                    .map(url => (
                        <img
                        key={url}
                        src={url}
                        width={160}
                        draggable
                        onDragStart={() => setDragged(url)}
                        style={{
                            flexShrink: 0,    // ← 縮まない
                            borderRadius: 6,
                            cursor: "grab"
                        }}
                        />
                    ))}
                </div>
            </div>



            <h2 style={{ marginTop: 40 }}>分類グリッド</h2>

            {/* ✅ グリッドは固定幅中央配置 */}
            <div
                style={{
                width: 1150,
                margin: "0px auto",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gridTemplateRows: "repeat(3, 220px)",
                gap: "15px",

                backgroundColor: "red",
                backgroundImage: "url('/grid-bg.png')",
                backgroundSize: "cover",       // ぴったり埋める
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
                }}
                
            >
                {CATEGORIES.map(cat => (
                <div
                    key={cat}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(cat)}
                    style={{
                    width: 220,
                    height: 220,
                    border: "2px solid #888",
                    position: "relative",
                    overflowY: "auto",
                    background: "#fafafa",
                    boxSizing: "border-box",
                    paddingTop: 25
                    }}
                >
                    {/* アルファベット */}
                    <div
                    style={{
                        position: "absolute",
                        top: 5,
                        left: 10,
                        fontWeight: "bold",
                        fontSize: 18
                    }}
                    >
                    {cat}
                    </div>

                    {Object.entries(labels)
                    .filter(([_, c]) => c === cat)
                    .map(([url]) => (
                        <img
                        key={url}
                        src={url}
                        width={70}
                        draggable
                        onDragStart={() => setDragged(url)}
                        style={{
                            margin: 4,
                            borderRadius: 4,
                            cursor: "grab"
                        }}
                        />
                    ))}
                </div>
                ))}
            </div>

            <div style={{ marginTop: 40, textAlign: "center" }}>
                <button onClick={exportCSV}>CSVとして送信</button>
            </div>
        </div>
        </div>
    );
}
