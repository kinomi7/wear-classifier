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

  // CSV出力（変更なし）
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

  // ドロップ処理
  const handleDrop = (cat) => {
    if (dragged) {
      setLabels(prev => ({ ...prev, [dragged]: cat }));
      setDragged(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>未分類画像（ドラッグして配置）</h2>

      {/* 上部：未分類 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 40
        }}
      >
        {images
          .filter(url => !labels[url])
          .map(url => (
            <img
              key={url}
              src={url}
              width={100}
              draggable
              onDragStart={() => setDragged(url)}
              style={{ cursor: "grab" }}
            />
          ))}
      </div>

      <h2>分類グリッド</h2>

      {/* 下部：15マス */}
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
                  style={{ margin: 4, cursor: "grab" }}
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
