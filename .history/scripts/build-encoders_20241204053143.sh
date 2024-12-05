#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display messages
function echo_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

function echo_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Define project root based on script location
PROJECT_ROOT="$SCRIPT_DIR/.."

# Define directories
BUILD_DIR="$PROJECT_ROOT/base_universal/webgl/transcoder/build"
SOURCE_DIR="$PROJECT_ROOT/base_universal/webgl/transcoder"
OUTPUT_DIR="$PROJECT_ROOT/src/utils/compression/base_transcoder"

# Ensure Emscripten environment is sourced
if ! command -v emcmake &> /dev/null
then
    echo_error "Emscripten not found. Please ensure Emscripten is installed and emsdk_env.sh is sourced."
    exit 1
fi

# Create the build directory if it doesn't exist
echo_info "Creating build directory at $BUILD_DIR..."
mkdir -p "$BUILD_DIR"

# Navigate to the build directory
cd "$BUILD_DIR"

# Configure the project with CMake using Emscripten
echo_info "Configuring CMake with Emscripten..."
emcmake cmake "$SOURCE_DIR" -DKTX2=TRUE -DKTX2_ZSTANDARD=TRUE

# Build the project using Make with parallel jobs
echo_info "Building the project with Make..."
make -j$(nproc)

# Verify that the output files were created
if [[ ! -f "basis_transcoder.js" || ! -f "basis_transcoder.wasm" ]]; then
    echo_error "Build failed: Transcoder files not found."
    exit 1
fi

# Ensure the output directory exists
echo_info "Ensuring output directory exists at $OUTPUT_DIR..."
mkdir -p "$OUTPUT_DIR"

# Move the generated files to the output directory
echo_info "Moving generated files to $OUTPUT_DIR..."
cp "basis_transcoder.js" "basis_transcoder.wasm" "$OUTPUT_DIR"

# Confirm the files have been moved
if [[ -f "$OUTPUT_DIR/basis_transcoder.js" && -f "$OUTPUT_DIR/basis_transcoder.wasm" ]]; then
    echo -e "\033[1;32mBuild and copy process completed successfully.\033[0m"
else
    echo_error "Failed to move transcoder files to $OUTPUT_DIR."
    exit 1
fi
