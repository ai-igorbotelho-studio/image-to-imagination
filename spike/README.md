# Stage 2 spike bench

Plain HTML + JS, no build, no paid dependency. Everything runs locally in the browser; nothing is uploaded.

    ./fetch-models.sh        # downloads the models (about 450 MB) into ./models
    node serve.mjs           # http://localhost:8765  (adds COOP/COEP so WASM threads work)
    node run-spike.mjs desktop   # optional: Playwright/Chromium automated run -> results/*.json

Open the page, choose an image, pick a model, press "Remove background" / "Upscale" / "Probe canvas limits".
Every action appends a JSON line (time, model size, heap) to the log box. Manual test script for iPhone/Android: see
../transition-interactive/stage-2-spike-report.md, section 9.
