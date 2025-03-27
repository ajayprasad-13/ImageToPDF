import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Columns, Images } from "lucide-react";

const App = () => {
  const [images, setImages] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);
    // console.log(files);
  };

  const handleDelete = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    const pdfDoc = await PDFDocument.create();

    for (const imgFile of images) {
      const imgBytes = await imgFile.arrayBuffer();
      const img = await pdfDoc
        .embedJpg(imgBytes)
        .catch(() => pdfDoc.embedPng(imgBytes));

      const { width, height } = img.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    link.download = "images.pdf";
    link.click();
  };

  useEffect(() => {}, [images]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>File is converted on your machine.We dont store any of your data</p>
      <div style={{ border: "1px solid grey", padding: "20px" }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <ul>
          {images.map((img, index) => (
            <li key={index} style={{ fontSize: "14px", color: "#333" }}>
              {img.name}
              <button onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))}
        </ul>
        <button
          onClick={convertToPDF}
          disabled={images.length === 0}
          style={{
            padding: "10px 20px",
            marginTop: "10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Convert to PDF
        </button>
      </div>
    </div>
  );
};

export default App;
