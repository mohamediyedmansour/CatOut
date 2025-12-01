import os

os.environ.setdefault("NUMBA_DISABLE_JIT", "1")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)