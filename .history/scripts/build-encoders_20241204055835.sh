#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display informational messages
function echo_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

# Function to display error messages
function echo_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Define project root based on script location
PROJECT_ROOT="$SCRIPT_DIR/.."

# Define encoder-specific directories
declare -A ENCODERS
ENCODERS=(
    ["basis_transcoder"]="basis_universal/webgl/transcoder"
    ["ktx2_encoder"]="ktx2_encoder"
)

# Define output base directory
OUTPUT_BASE="$PROJECT_ROOT/src/utils/compression/encoders"

# Ensure Emscripten environment is sourced by checking for emcmake
if ! command -v emcmake &> /dev/null
then
    echo_error "Emscripten not found. Please ensure Emscripten is installed and emsdk_env.sh is sourced."
    exit 1
fi

# Function to build an encoder
build_encoder() {
    local ENCODER_NAME=$1
    local SOURCE_SUBDIR=$2

    echo_info "Starting build for $ENCODER_NAME..."

    # Define source and build directories
    local SOURCE_DIR="$PROJECT_ROOT/$SOURCE_SUBDIR"
    local BUILD_DIR="$SOURCE_DIR/build"
    local OUTPUT_DIR="$OUTPUT_BASE/$ENCODER_NAME"

    # Check if SOURCE_DIR exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo_error "Source directory $SOURCE_DIR does not exist for $ENCODER_NAME."
        exit 1
    fi

    # Check if BUILD_DIR exists
    if [ ! -d "$BUILD_DIR" ]; then
        echo_error "Build directory $BUILD_DIR does not exist for $ENCODER_NAME."
        echo_error "Please ensure that the '$ENCODER_NAME' repository is cloned correctly and the build directory is present."
        exit 1
    fi

    # Navigate to the build directory
    echo_info "Navigating to build directory: $BUILD_DIR"
    cd "$BUILD_DIR"

    # Clean the build directory by removing all contents
    echo_info "Cleaning the build directory for $ENCODER_NAME..."
    rm -rf ./*

    # Configure the project with CMake using Emscripten
    echo_info "Configuring CMake with Emscripten for $ENCODER_NAME..."
    if [ "$ENCODER_NAME" == "basis_transcoder" ]; then
        emcmake cmake "$SOURCE_DIR" -DKTX2=TRUE -DKTX2_ZSTANDARD=TRUE
    elif [ "$ENCODER_NAME" == "ktx2_encoder" ]; then
        # Based on the README, adjust build options as needed
        # For example, disabling load test apps
        emcmake cmake "$SOURCE_DIR" -DKTX_FEATURE_LOADTEST_APPS=OFF
    else
        echo_error "Unknown encoder name: $ENCODER_NAME"
        exit 1
    fi

    # Get the number of CPU cores for parallel make
    NUM_CORES=$(getconf _NPROCESSORS_ONLN || echo 1)

    # Build the project using Make with parallel jobs
    echo_info "Building the $ENCODER_NAME project with Make using $NUM_CORES cores..."
    make -j"$NUM_CORES"

    # Define expected output files based on encoder
    if [ "$ENCODER_NAME" == "basis_transcoder" ]; then
        OUTPUT_FILES=("basis_transcoder.js" "basis_transcoder.wasm")
    elif [ "$ENCODER_NAME" == "ktx2_encoder" ]; then
        OUTPUT_FILES=("ktx_js.js" "ktx_js.wasm" "ktx_js_read.js" "ktx_js_read.wasm" "msc_basis_transcoder_js.js" "msc_basis_transcoder_js.wasm")
    fi

    # Verify that the output files were created
    for file in "${OUTPUT_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            echo_error "Build failed: Transcoder file '$file' not found for $ENCODER_NAME."
            exit 1
        fi
    done

    # Ensure the output directory exists
    echo_info "Ensuring output directory exists at $OUTPUT_DIR..."
    mkdir -p "$OUTPUT_DIR"

    # Move the generated files to the output directory
    echo_info "Moving generated files to $OUTPUT_DIR..."
    for file in "${OUTPUT_FILES[@]}"; do
        cp "$file" "$OUTPUT_DIR"
    done

    # Confirm the files have been moved
    for file in "${OUTPUT_FILES[@]}"; do
        if [[ ! -f "$OUTPUT_DIR/$file" ]]; then
            echo_error "Failed to move transcoder file '$file' to $OUTPUT_DIR."
            exit 1
        fi
    done

    echo -e "\033[1;32m$ENCODER_NAME build and copy process completed successfully.\033[0m"
}

# Build basis_transcoder
build_encoder "basis_transcoder" "basis_universal/webgl/transcoder"

# Build ktx2_encoder
build_encoder "ktx2_encoder" "ktx2_encoder"

# Exit successfully
exit 0
