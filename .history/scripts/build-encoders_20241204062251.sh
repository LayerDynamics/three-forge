#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display informational messages
echo_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

# Function to display error messages
echo_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Define project root based on script location
PROJECT_ROOT="$SCRIPT_DIR/.."

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
    local ENCODER_NAME="$1"          # Name of the encoder (e.g., basis_transcoder, ktx2_encoder)
    local SOURCE_SUBDIR="$2"          # Relative path to the encoder's source directory
    local CMAKE_OPTIONS="$3"          # Additional CMake options

    echo_info "Starting build for $ENCODER_NAME..."

    # Define source and build directories
    local SOURCE_DIR="$PROJECT_ROOT/$SOURCE_SUBDIR"
    local BUILD_DIR="$SOURCE_DIR/build-$ENCODER_NAME"  # Unique build directory for each encoder
    local OUTPUT_DIR="$OUTPUT_BASE/$ENCODER_NAME"

    # Check if SOURCE_DIR exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo_error "Source directory '$SOURCE_DIR' does not exist for $ENCODER_NAME."
        exit 1
    fi

    # Configure the project with CMake using Emscripten
    echo_info "Configuring CMake with Emscripten for $ENCODER_NAME..."
    emcmake cmake -B "$BUILD_DIR" "$SOURCE_DIR" $CMAKE_OPTIONS

    # Get the number of CPU cores for parallel make
    NUM_CORES=$(getconf _NPROCESSORS_ONLN || echo 1)

    # Build the project using CMake's build command with parallel jobs
    echo_info "Building the $ENCODER_NAME project with Make using $NUM_CORES cores..."
    cmake --build "$BUILD_DIR" -- -j"$NUM_CORES"

    # Define expected output files based on encoder
    if [ "$ENCODER_NAME" == "basis_transcoder" ]; then
        OUTPUT_FILES=("basis_transcoder.js" "basis_transcoder.wasm")
    elif [ "$ENCODER_NAME" == "ktx2_encoder" ]; then
        OUTPUT_FILES=("ktx_js.js" "ktx_js.wasm" "ktx_js_read.js" "ktx_js_read.wasm" "msc_basis_transcoder_js.js" "msc_basis_transcoder_js.wasm")
    else
        echo_error "Unknown encoder name: $ENCODER_NAME"
        exit 1
    fi

    # Verify that the output files were created in the build directory
    missing_files=()
    for file in "${OUTPUT_FILES[@]}"; do
        if [[ ! -f "$BUILD_DIR/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    # If any files are missing, and ENCODER_NAME is ktx2_encoder, check in tests/webgl
    if [ ${#missing_files[@]} -gt 0 ] && [ "$ENCODER_NAME" == "ktx2_encoder" ]; then
        echo_info "Some files not found in build directory for $ENCODER_NAME. Checking tests/webgl..."
        for file in "${missing_files[@]}"; do
            if [[ -f "$PROJECT_ROOT/tests/webgl/$file" ]]; then
                echo_info "Found $file in tests/webgl. Copying to '$OUTPUT_DIR'..."
                cp "$PROJECT_ROOT/tests/webgl/$file" "$OUTPUT_DIR/"
                # Remove found file from missing_files
                missing_files=("${missing_files[@]/$file/}")
            else
                echo_error "Build failed: Transcoder file '$file' not found for $ENCODER_NAME."
                exit 1
            fi
        done
    fi

    # Ensure the output directory exists
    echo_info "Ensuring output directory exists at '$OUTPUT_DIR'..."
    mkdir -p "$OUTPUT_DIR"

    # Move the generated files to the output directory from build directory
    echo_info "Moving generated files to '$OUTPUT_DIR'..."
    for file in "${OUTPUT_FILES[@]}"; do
        if [[ -f "$BUILD_DIR/$file" ]]; then
            cp "$BUILD_DIR/$file" "$OUTPUT_DIR/"
        fi
    done

    # Additionally, if ENCODER_NAME is ktx2_encoder, copy from tests/webgl
    if [ "$ENCODER_NAME" == "ktx2_encoder" ]; then
        echo_info "Copying built files from tests/webgl to '$OUTPUT_DIR'..."
        for file in "${OUTPUT_FILES[@]}"; do
            if [[ -f "$PROJECT_ROOT/tests/webgl/$file" ]]; then
                cp "$PROJECT_ROOT/tests/webgl/$file" "$OUTPUT_DIR/"
            fi
        done
    fi

    # Confirm the files have been moved
    for file in "${OUTPUT_FILES[@]}"; do
        if [[ ! -f "$OUTPUT_DIR/$file" ]]; then
            echo_error "Failed to move transcoder file '$file' to '$OUTPUT_DIR'."
            exit 1
        fi
    done

    echo -e "\033[1;32m$ENCODER_NAME build and copy process completed successfully.\033[0m"
}

# Build basis_transcoder
build_encoder "basis_transcoder" "basis_universal/webgl/transcoder" "-DKTX2=TRUE -DKTX2_ZSTANDARD=TRUE"

# Build ktx2_encoder
build_encoder "ktx2_encoder" "ktx2_encoder" "-DKTX_FEATURE_LOADTEST_APPS=OFF"

# Exit successfully
exit 0
