import { useEffect, useState } from "react";

    const CATEGORIES = [
    "a","b","c","d","e",
    "f","g","h","i","j",
    "k","l","m","n","o"
    ];

    export default function App() {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState({});
    const [index, setIndex] = useState(0);

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

    const url = images[index];

    const setCategory = (url, cat) => {
        setLabels(prev => ({ ...prev, [url]: cat }));
    };

    const goNext = () => {
        if (index < images.length - 1) {
        setIndex(index + 1);
        }
    };

    const goPrev = () => {
        if (index > 0) {
        setIndex(index - 1);
        }
    };

    const goFirst = () => setIndex(0);
    const goLast = () => setIndex(images.length - 1);

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
        <div style={{ padding: 20, textAlign: "center" }}>
        <h1>コーデ画像分類（a〜o）</h1>

        <p>
            {index + 1} / {images.length}
        </p>

        {/* 画像スライド */}
        <div style={{ marginTop: 20 }}>
            <div style={{ margin: "20px 0" }}>
            <img
                src={url}
                width={300}
                style={{ transition: "0.3s ease" }}
            />
            </div>

            <button onClick={goFirst}>⏮ 最初</button>
            <button onClick={goPrev} disabled={index === 0}>◀ 前</button>
            <button onClick={goNext} disabled={index === images.length - 1}>
            次 ▶
            </button>
            <button onClick={goLast}>最後 ⏭</button>
        </div>

        {/* カテゴリボタン */}
        <div style={{ marginTop: 10 }}>
            {CATEGORIES.map(cat => (
            <button
                key={cat}
                onClick={() => setCategory(url, cat)}
                style={{
                margin: 2,
                background: labels[url] === cat ? "#333" : "#eee",
                color: labels[url] === cat ? "#fff" : "#000"
                }}
            >
                {cat}
            </button>
            ))}
        </div>

        {/* 15マス表示 */}
        <div
            style={{
            marginTop: 50,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10
            }}
        >
            {CATEGORIES.map(cat => (
            <div
                key={cat}
                style={{
                border: "1px solid #ccc",
                minHeight: 150,
                padding: 5
                }}
            >
                {Object.entries(labels)
                .filter(([_, c]) => c === cat)
                .map(([imgUrl]) => (
                    <img
                    key={imgUrl}
                    src={imgUrl}
                    width={60}
                    style={{ margin: 2 }}
                    />
                ))}
            </div>
            ))}
        </div>

        <div style={{ marginTop: 30 }}>
            <button onClick={exportCSV}>CSVとして送信</button>
        </div>
        </div>
    );
}
