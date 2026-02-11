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

  const handleDrop = (cat) => {
    if (dragged) {
      setLabels(prev => ({ ...prev, [dragged]: cat }));
      setDragged(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>未分類画像（横スクロール）</h2>

      {/* 横スライドエリア */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 10,
          padding: 10,
          border: "1px solid #ddd",
          whiteSpace: "nowrap"
        }}
      >
        {images
          .filter(url => !labels[url])
          .map(url => (
            <img
              key={url}
              src={url}
              width={140}
              draggable
              onDragStart={() => setDragged(url)}
              style={{
                cursor: "grab",
                flexShrink: 0,
                borderRadius: 6
              }}
            />
          ))}
      </div>

      <h2 style={{ marginTop: 40 }}>分類グリッド</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10
        }}
      >
        {CATEGORIES.map(cat => (
          <div
            key={cat}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cat)}
            style={{
              border: "2px solid #ccc",
              minHeight: 160,
              padding: 5
            }}
          >
            {Object.entries(labels)
              .filter(([_, c]) => c === cat)
              .map(([url]) => (
                <img
                  key={url}
                  src={url}
                  width={80}
                  draggable
                  onDragStart={() => setDragged(url)}
                  style={{
                    margin: 4,
                    cursor: "grab",
                    borderRadius: 4
                  }}
                />
              ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <button onClick={exportCSV}>CSVとして送信</button>
      </div>
    </div>
  );
}
