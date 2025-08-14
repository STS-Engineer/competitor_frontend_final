import React, { useState } from "react";
import axios from "axios";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);


  const handleUpload = async () => {
    if (!file) return setMessage("⚠️ Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://compt-back.azurewebsites.net/companies/upload-excel",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ " + res.data);

      // Clear the file and message after 3 seconds
      setTimeout(() => {
        setFile(null);
        setMessage("");
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed.");

      // Clear error message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "30px",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "20px"
          }}
        >
          Upload Excel File
        </h2>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #cbd5e1",
            borderRadius: "15px",
            padding: "40px 20px",
            cursor: "pointer",
            marginBottom: "10px",
            transition: "border-color 0.3s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "50px", height: "50px", color: "#3b82f6", marginBottom: "10px" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-3 3m3-3l3 3M12 4v8"
            />
          </svg>
          <span style={{ color: "#4b5563", fontWeight: "500" }}>
            Click to select an Excel file
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <p style={{ color: "#374151", marginBottom: "15px", fontWeight: "500" }}>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button
          onClick={handleUpload}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "linear-gradient(90deg, #3b82f6, #6366f1)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "16px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
            transition: "all 0.3s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "linear-gradient(90deg, #2563eb, #4f46e5)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "linear-gradient(90deg, #3b82f6, #6366f1)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
          }}
        >
          Upload
        </button>

        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.includes("✅") ? "#16a34a" : "#dc2626",
              fontWeight: "500"
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Upload;
