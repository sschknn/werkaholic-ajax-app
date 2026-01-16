#!/bin/sh

# Kilocode CLI Installation Script for FreeBSD

set -e # Exit on error

echo "Installing dependencies..."
pkg install -y node npm git

echo "Cloning Kilocode CLI..."
if [ -d "kilocode-cli" ]; then
    echo "Directory kilocode-cli already exists. Pulling latest changes..."
    cd kilocode-cli
    git pull
else
    git clone https://github.com/kilocode/kilocode-cli.git
    cd kilocode-cli
fi

echo "Installing NPM dependencies..."
npm install

echo "Linking CLI globally..."
npm install -g .

echo "Verifying installation..."
kilocode --version

echo "Installation complete!"