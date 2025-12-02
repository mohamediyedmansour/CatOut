# Helper script to pre-download rembg/U2Net model into the backend cache
import os, base64

cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".u2net")
os.environ.setdefault("XDG_CACHE_HOME", cache_dir)
os.environ.setdefault("HOME", cache_dir)
os.environ.setdefault("U2NET_HOME", cache_dir)

print("Cache dir:", cache_dir)
print("Ensuring directory exists...")
os.makedirs(cache_dir, exist_ok=True)

try:
    from rembg import remove
except Exception as e:
    print("Failed to import rembg:", e)
    raise

# A tiny 1x1 PNG to trigger model download
png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
png = base64.b64decode(png_b64)

print("Calling rembg.remove(...) to trigger model download. This may take a while...")
try:
    # We don't need the output; this call forces rembg/pooch to fetch the model files.
    _ = remove(png)
    print("Model download triggered successfully.")
except Exception as exc:
    print("rembg.remove raised an exception (processing may have failed).")
    print("If the model was downloaded this is OK. Exception:\n", exc)
    # Re-raise to make failures visible when needed
    raise
