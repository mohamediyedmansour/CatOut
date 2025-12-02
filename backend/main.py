import os

os.environ.setdefault("NUMBA_DISABLE_JIT", "1")
# Ensure pooch/rembg use a writable cache directory even if HOME is unset
cache_dir = os.path.join(os.path.dirname(__file__), ".u2net")
os.environ.setdefault("XDG_CACHE_HOME", cache_dir)
os.environ.setdefault("HOME", cache_dir)
os.environ.setdefault("U2NET_HOME", cache_dir)
# Create cache directory early so pooch/rembg can write into it at runtime
try:
    os.makedirs(cache_dir, exist_ok=True)
except Exception:
    # If creation fails, rembg/pooch may still attempt to use fallback dirs and
    # produce useful error messages; log will show permission errors.
    pass

import fastapi
import rembg
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/remove-background/")
async def remove_background(file: fastapi.UploadFile):
    try:
        input_image = await file.read()
        output_image = rembg.remove(input_image)
        return fastapi.Response(content=output_image, media_type="image/png")
    except Exception as exc: 
        print("Error removing background:", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "detail": str(exc)},
        )

#Wizardry so render.com doesnt nuke our app
@app.get("/getTime")
async def get_time():
    import datetime
    now = datetime.datetime.utcnow()
    return {"time": now.isoformat() + "Z"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)