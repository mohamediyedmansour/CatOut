import React, { useCallback, useRef, useState } from "react";
import { uploadImage } from "./api";
import { saveBlobAsPng } from "./download";
import "./App.css";

type UploadState = "idle" | "uploading" | "done" | "error";

function formatProgress(p: number) {
  return `${Math.round(p * 100)}%`;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFile = useCallback((f: File | null) => {
    setError(null);
    setProgress(0);
    setStatus("idle");
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const chosen =
      e.target.files && e.target.files[0] ? e.target.files[0] : null;
    onFile(chosen);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped =
      e.dataTransfer.files && e.dataTransfer.files[0]
        ? e.dataTransfer.files[0]
        : null;
    onFile(dropped);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setProgress(0);
    try {
      const resultBlob = await uploadImage(file, (p) => setProgress(p));
      setStatus("done");
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const downloadName = `${baseName}.png`;
      saveBlobAsPng(resultBlob, downloadName);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="app-root">
      <h1>Image Upload & Auto-download (PNG)</h1>
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="File upload dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="preview" />
        ) : (
          <div className="drop-instructions">
            Drop an image here, or click to select
          </div>
        )}
      </div>

      <div className="controls">
        <div className="meta">
          <div>
            <strong>Selected:</strong> {file ? file.name : "None"}
          </div>
          <div>
            <strong>Status:</strong> {status}
          </div>
        </div>

        <div className="actions">
          <button
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
            className="btn-primary"
          >
            Upload
          </button>
          <button onClick={handleClear} className="btn-secondary">
            Clear
          </button>
        </div>

        <div className="progress-row">
          <progress value={progress} max={1} />
          <div className="progress-label">{formatProgress(progress)}</div>
        </div>

        {error && <div className="error">Error: {error}</div>}
      </div>
    </div>
  );
};

export default App;
