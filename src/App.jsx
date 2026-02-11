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
    <div style={{ padding: 20 }}>

      <h2>未分類画像</h2>

      {/* ✅ 横スクロールはここだけ */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 10,
          padding: 10,
          border: "1px solid #ddd",
          marginBottom: 40
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

      <h2>分類グリッド</h2>

      {/* ✅ グリッドは固定サイズ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 220px)",
          gridTemplateRows: "repeat(3, 220px)",
          gap: 15,
          justifyContent: "center"
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
              border: "2px solid #aaa",
              position: "relative",
              overflowY: "auto",  // ← マス内だけ縦スクロール
              padding: 5,
              boxSizing: "border-box"
            }}
          >
            {/* アルファベット表示 */}
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 8,
                fontWeight: "bold",
                fontSize: 18
              }}
            >
              {cat}
            </div>

            <div style={{ marginTop: 25 }}>
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
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <button onClick={exportCSV}>CSVとして送信</button>
      </div>
    </div>
  );
}
