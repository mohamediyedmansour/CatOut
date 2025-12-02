FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libgl1 \
       libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt

RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r ./requirements.txt

COPY . /app
ENV XDG_CACHE_HOME=/app/.u2net
ENV U2NET_HOME=/app/.u2net
ENV HOME=/app

RUN mkdir -p /app/.u2net && chown -R root:root /app/.u2net

# Pre-download rembg's model during image build so the runtime doesn't need to
# write to an unwritable cache path. This decodes a tiny 1x1 PNG and calls
# `rembg.remove` to force pooch/rembg to download model files into
# `$XDG_CACHE_HOME`.
RUN python - <<'PY'
import os, sys, base64, traceback
os.environ['XDG_CACHE_HOME'] = '/app/.u2net'
os.environ['U2NET_HOME'] = '/app/.u2net'
os.environ['HOME'] = '/app'
try:
    from rembg import remove
except Exception:
    traceback.print_exc()
    sys.exit(1)

png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==')
try:
    remove(png)
except Exception:
    # We expect rembg to download the model during this call. If it fails,
    # surface the error so the image build fails and is visible locally.
    traceback.print_exc()
    sys.exit(1)
PY

RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /app \
    && chown -R app:app /app/.u2net
USER app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
