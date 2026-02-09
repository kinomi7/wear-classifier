import { useEffect, useState } from "react";

const CATEGORIES = ["a","b","c","d","e","f","g","h","i","j"];

export default function App() {
  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState({});
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch('${import.meta.env.BASE_URL}wear_images_women.csv')
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
      <h1>コーデ画像分類（a〜j）</h1>

      <p>
        {index + 1} / {images.length}
      </p>

      <input
        type="range"
        min="0"
        max={images.length - 1}
        value={index}
        onChange={e => setIndex(Number(e.target.value))}
        style={{ width: "80%" }}
      />

      <div style={{ marginTop: 20 }}>
        <img src={url} width={300} />
      </div>

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

      <div style={{ marginTop: 30 }}>
        <button onClick={exportCSV}>CSVとして送信</button>
      </div>
    </div>
  );
}
