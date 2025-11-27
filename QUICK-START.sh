#!/usr/bin/env bash

# ⚡ QUICK START - Energy Monitor Card for HACS
# Questo script ti guida rapidamente attraverso il setup

echo "🎯 Energy Monitor Card - Quick Setup"
echo "===================================="
echo ""

# Step 1
echo "📁 STEP 1: Creare struttura cartelle"
echo "Crea questa struttura nel tuo computer:"
echo ""
echo "  energy-monitor-card/"
echo "  ├── dist/"
echo "  │   ├── energy-monitor-card.js"
echo "  │   └── energy-monitor-editor.js"
echo "  ├── manifest.json"
echo "  ├── package.json"
echo "  ├── README.md"
echo "  ├── LICENSE"
echo "  └── .gitignore"
echo ""

# Step 2
echo "🧪 STEP 2: Test Locale"
echo "1. Copia la cartella in: /config/www/community/energy-monitor-card/"
echo "2. In Home Assistant:"
echo "   - Impostazioni → Dashboard → Risorse"
echo "   - Aggiungi: /local/community/energy-monitor-card/dist/energy-monitor-card.js"
echo "   - Riavvia Home Assistant"
echo "3. Crea una nuova card nel dashboard"
echo "4. Verifica che tutto funzioni"
echo ""

# Step 3
echo "📤 STEP 3: GitHub Setup"
echo "1. Crea account su https://github.com"
echo "2. Crea nuovo repository 'energy-monitor-card' (PUBBLICO)"
echo ""

# Step 4
echo "📝 STEP 4: Git Configuration"
echo "Esegui nel terminale:"
echo ""
echo "  git config --global user.name 'Your Name'"
echo "  git config --global user.email 'your.email@example.com'"
echo "  cd ~/Progetti  # o dove preferisci"
echo "  git clone https://github.com/TUO_USERNAME/energy-monitor-card.git"
echo "  cd energy-monitor-card"
echo ""

# Step 5
echo "📁 STEP 5: Aggiungere File"
echo "Copia tutti i file dalla struttura creata al passo 1"
echo ""

# Step 6
echo "🚀 STEP 6: Push su GitHub"
echo "Nel terminale, nella cartella energy-monitor-card:"
echo ""
echo "  git add ."
echo "  git commit -m 'Initial commit: Energy Monitor Card v1.0.0'"
echo "  git push origin main"
echo ""

# Step 7
echo "🏷️  STEP 7: Creare Release"
echo ""
echo "  git tag -a v1.0.0 -m 'Release v1.0.0 - Initial Release'"
echo "  git push origin v1.0.0"
echo ""
echo "Poi vai su GitHub:"
echo "  - Releases"
echo "  - Create release da tag v1.0.0"
echo ""

# Step 8
echo "📦 STEP 8: Aggiungere a HACS"
echo "In Home Assistant:"
echo "  1. HACS → Tre puntini → Custom repositories"
echo "  2. Aggiungi:"
echo "     URL: https://github.com/TUO_USERNAME/energy-monitor-card"
echo "     Category: Frontend"
echo "  3. HACS → Frontend → Installa 'Energy Monitor Card'"
echo ""

# Summary
echo "✅ FATTO!"
echo ""
echo "📚 Guide disponibili:"
echo "  - DEPLOYMENT-GUIDE.md: Guida dettagliata GitHub + HACS"
echo "  - LOCAL-TESTING-GUIDE.md: Guida test locale"
echo "  - COMPLETE-README.md: Documentazione completa"
echo "  - COMPLETE-SETUP-SUMMARY.md: Riepilogo setup"
echo ""
echo "🎉 La tua Energy Monitor Card è pronta!"
echo ""
echo "Domande?"
echo "  - Leggi le guide sopra"
echo "  - Apri issue su GitHub"
echo "  - Chiedi nella community Home Assistant"
echo ""
