#!/bin/bash

# Kilocode CLI Installation Script for Google Cloud Shell
# Free Tier compatible (runs in Cloud Shell)

echo "Starting installation in Google Cloud Shell..."

# Check for NPM
if ! command -v npm &> /dev/null; then
    echo "NPM could not be found. Cloud Shell usually has it. Attempting to install Node..."
    # In standard Cloud Shell, node is pre-installed via nvm
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Kilocode globally
echo "Installing kilocode package via npm..."
npm install -g kilocode

# Verify
if command -v kilocode &> /dev/null; then
    echo "-----------------------------------"
    echo "Success! Kilocode CLI is installed."
    kilocode --version
    echo "-----------------------------------"
else
    echo "Error: Installation failed."
    exit 1
fi
