//save blob as png file
export function saveBlobAsPng(blob: Blob, filename: string): void {
  // Ensure the blob gets the correct MIME type if not present
  const pngBlob = blob.type ? blob : new Blob([blob], { type: "image/png" });
  const url = URL.createObjectURL(pngBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  // Append to DOM to ensure click works in some browsers
  document.body.appendChild(a);
  a.click();
  a.remove();
  // release object URL after a short timeout to ensure download started
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
