#!/bin/bash
echo "Starting Astro Annihilator Reborn..."
echo ""
cd "$(dirname "$0")"
echo "Changed to directory: $(pwd)"
echo ""
echo "Installing dependencies if needed..."
npm install
echo ""
echo "Starting development server..."
npm run dev 