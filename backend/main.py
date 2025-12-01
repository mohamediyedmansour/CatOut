import fastapi
import rembg

app = fastapi.FastAPI()

@app.post("/remove-background/")
async def remove_background(file: fastapi.UploadFile):
    input_image = await file.read()
    output_image = rembg.remove(input_image)
    return fastapi.Response(content=output_image, media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)