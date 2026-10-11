#!/usr/bin/env bash
# Downloads the spike candidates into ./models (free, public HF repos; no account needed). Licenses: see stage-2-spike-report.md.
set -euo pipefail; cd "$(dirname "$0")"; mkdir -p models samples; H=https://huggingface.co
get(){ [ -f "models/$1" ] || curl -fsSL -o "models/$1" "$2"; }
get isnet_fp16.onnx  $H/Ko033/isnet-general-use-onnx/resolve/main/onnx/model_fp16.onnx
get isnet_q.onnx     $H/Ko033/isnet-general-use-onnx/resolve/main/onnx/model_quantized.onnx
get u2netp.onnx      $H/BritishWerewolf/U-2-Netp/resolve/main/onnx/model.onnx
get u2net.onnx       $H/BritishWerewolf/U-2-Net/resolve/main/onnx/model.onnx
get modnet_fp16.onnx $H/Xenova/modnet/resolve/main/onnx/model_fp16.onnx
get modnet_q.onnx    $H/Xenova/modnet/resolve/main/onnx/model_quantized.onnx
get birefnet_lite_fp16.onnx $H/onnx-community/BiRefNet_lite-ONNX/resolve/main/onnx/model_fp16.onnx
get swin2sr_x2_q.onnx $H/Xenova/swin2SR-classical-sr-x2-64/resolve/main/onnx/model_quantized.onnx
get realesr_general_x4v3.onnx $H/tamnvcc/Real-ESRGAN-General-x4v3_float/resolve/main/onnx/model.onnx
# vendor/ holds onnxruntime-web 1.30.0 (MIT): npm pack onnxruntime-web@1.30.0 -> dist/ort.min.js + ort-wasm-simd-threaded(.jsep).{mjs,wasm}
echo "Put your OWN test photos in ./samples (do not commit)."
