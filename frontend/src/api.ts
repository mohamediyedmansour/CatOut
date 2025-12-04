export type ProgressCallback = (progress: number) => void;

export async function uploadImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const url = "https://catout-api.iyed.space/remove-background";
  //const url = "http://localhost:8000/remove-background";
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "blob"; // expect binary blob (image)

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const resp = xhr.response;
        if (resp instanceof Blob) {
          resolve(resp);
        } else {
          // Shouldn't happen
          try {
            // If server returned JSON describing an error
            const text = new TextDecoder().decode(new Uint8Array(xhr.response));
            reject(new Error(`Unexpected response type: ${text}`));
          } catch (e) {
            reject(new Error("Unexpected response from server"));
          }
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (ev: ProgressEvent<EventTarget>) => {
        if (ev.lengthComputable) {
          onProgress(ev.loaded / ev.total);
        }
      };
    }

    const form = new FormData();
    form.append("file", file, file.name);
    xhr.send(form);
  });
}
