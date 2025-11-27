#!/bin/bash

# Build script per Energy Monitor Card
# Questo script prepara i file per la distribuzione

set -e

echo "🔨 Building Energy Monitor Card..."

# Crea directory dist
mkdir -p dist

# Copia i file JS principali
cp energy-monitor-card.js dist/
cp energy-monitor-editor.js dist/

echo "✅ Build completato!"
echo "📦 File pronti in dist/"
echo ""
echo "Prossimi step:"
echo "1. Carica i file su GitHub"
echo "2. Crea un release tag"
echo "3. HACS lo rilevarà automaticamente"
echo ""
echo "Struttura GitHub necessaria:"
echo "├── dist/"
echo "│   ├── energy-monitor-card.js"
echo "│   └── energy-monitor-editor.js"
echo "├── manifest.json"
echo "├── package.json"
echo "├── README.md"
echo "├── LICENSE"
echo "└── .gitignore"
