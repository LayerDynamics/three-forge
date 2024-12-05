#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define project directories
PROJECT_ROOT=~/three-forge
BUILD_DIR=$PROJECT_ROOT/base_universal/webgl/transcoder/build
SOURCE_DIR=$PROJECT_ROOT/base_universal/webgl/transcoder
OUTPUT_DIR=$PROJECT_ROOT/src/utils/compression/base_transcoder

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Navigate to build directory
cd "$BUILD_DIR"

echo "Configuring CMake with Emscripten..."
emcmake cmake "$SOURCE_DIR"

echo "Building the project with make..."
make -j$(nproc)

echo "Moving generated files to the output directory..."
cp basis_transcoder.js basis_transcoder.wasm "$OUTPUT_DIR"

echo "Build and copy process completed successfully."
