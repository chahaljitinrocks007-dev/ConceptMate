"use client";
import { useState } from "react";

export default function Solve() {
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Upload image first");

    setLoading(true);
    setAnswer("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/solve", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Upload Question</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Solve Question
      </button>

      <br /><br />

      {loading && <p>Solving... 🤖</p>}

      {answer && (
        <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: 20 }}>
          {answer}
        </div>
      )}
    </div>
  );
}
