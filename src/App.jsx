import React, { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";
import "./App.css";

const App = () => {
  const [images, setImages] = useState([]);
  const [size, setSize] = useState("original");

  const handleSize = (e) => {
    setSize(e.target.value);
    console.log(size);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleDelete = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    const pdfDoc = await PDFDocument.create();

    for (const imgFile of images) {
      const imgBytes = await imgFile.file.arrayBuffer();
      let img;

      if (
        imgFile.file.type === "image/jpeg" ||
        imgFile.file.type === "image/jpg"
      ) {
        img = await pdfDoc.embedJpg(imgBytes);
      } else if (imgFile.file.type === "image/png") {
        img = await pdfDoc.embedPng(imgBytes);
      }

      let height;
      let width;

      if (size === "original") {
        const imgScale = img.scale(1);
        height = imgScale.height;
        width = imgScale.width;
      } else if (size === "a4p") {
        height = 2480;
        width = 3508;
      } else if (size === "a4l") {
        height = 2480;
        width = 3508;
      }

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "images.pdf";
    link.click();

    setImages([]);
    console.log(images);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
    },
    multiple: true,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "10px",
      }}
    >
      <p style={{ fontSize: "14px", color: "#555" }}>
        File is converted on your machine. We don’t store any data.
      </p>

      <div className="dropdown">
        <select value={size} onChange={handleSize}>
          <option value={"original"}>Original Size</option>
          <option value={"a4p"}>Fit to A4 potrait</option>
          <option value={"a4l"}>Fit to A4 landscape</option>
        </select>
      </div>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed grey",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ width: "290.7px" }}>Drop the files here...</p>
        ) : (
          <p>Drag & drop or click to upload images</p>
        )}
      </div>

      <ul style={{ listStyleType: "none" }}>
        {images.map((img, index) => (
          <li key={index}>
            <div
              style={{
                width: "500px",
                height: "150px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f1f1f1",
                padding: "0px 10px",
                marginTop: "5px",
              }}
            >
              <img
                src={img.preview}
                style={{
                  width: "125px",
                  height: "140px",
                  objectFit: "contain",
                }}
              />
              <p style={{ color: "black" }}>{img.file.name}</p>
              <button
                onClick={() => handleDelete(index)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={convertToPDF}
        disabled={images.length === 0}
        style={{
          padding: "10px 20px",
          backgroundColor: images.length ? "blue" : "gray",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: images.length ? "pointer" : "not-allowed",
          marginTop: "10px",
        }}
      >
        Convert to PDF
      </button>
    </div>
  );
};

export default App;
