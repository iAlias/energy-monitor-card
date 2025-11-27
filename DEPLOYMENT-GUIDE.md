# 📚 GUIDA COMPLETA - Come Caricare su GitHub e HACS

Segui questi step per pubblicare il plugin su GitHub e renderlo disponibile tramite HACS.

## STEP 1: Preparare i File Locali

### 1.1 Struttura della Cartella

Crea questa struttura nel tuo computer:

```
energy-monitor-card/
├── dist/
│   ├── energy-monitor-card.js
│   └── energy-monitor-editor.js
├── manifest.json
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

### 1.2 Posizionare i File

1. Crea una cartella `energy-monitor-card`
2. Posiziona all'interno:
   - `energy-monitor-card.js` (rinominato da energy-monitor-card.js)
   - `energy-monitor-editor.js`
   - Metti entrambi anche in una sottocartella `dist/`
3. Copia i file di configurazione:
   - `manifest.json`
   - `package.json`
   - `README.md` (rinomina COMPLETE-README.md)
   - `LICENSE`
   - `.gitignore`

## STEP 2: Creazione Repository GitHub

### 2.1 Creare un Account GitHub

Se non lo hai già:
1. Vai su https://github.com/signup
2. Registrati gratuitamente
3. Verifica l'email

### 2.2 Creare il Repository

1. Accedi a https://github.com
2. Clicca su **+** (in alto a destra) → **New repository**
3. Compila il form:
   - **Repository name**: `energy-monitor-card`
   - **Description**: "Monitora i consumi energetici con confronti temporali"
   - **Public**: ☑️ (deve essere pubblico per HACS)
   - **Add a README file**: ☐ (lo abbiamo già)
   - **Add .gitignore**: ☐ (lo abbiamo già)
   - **Choose a license**: MIT License
4. Clicca **Create repository**

## STEP 3: Configurare Git in Locale

### 3.1 Installare Git

**Windows**: Scarica da https://git-scm.com/download/win  
**Mac**: `brew install git`  
**Linux**: `sudo apt-get install git`

### 3.2 Configurare Git

Apri il terminale e esegui:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3.3 Clonare il Repository

```bash
# Naviga dove vuoi salvare il progetto
cd ~/Progetti  # o dove preferisci

# Clona il repository (vuoto appena creato)
git clone https://github.com/TUOUSERNAME/energy-monitor-card.git
cd energy-monitor-card
```

Sostituisci `TUOUSERNAME` con il tuo username GitHub!

## STEP 4: Aggiungere i File

### 4.1 Copiare i File

Copia tutti i file della struttura nella cartella clonata:

```
energy-monitor-card/
├── dist/
│   ├── energy-monitor-card.js
│   └── energy-monitor-editor.js
├── manifest.json
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

### 4.2 Verificare i File

Nel terminale, posizionato nella cartella:

```bash
ls -la  # Mostra i file (Mac/Linux)
dir    # Mostra i file (Windows)
```

Dovresti vedere i file elencati.

## STEP 5: Effettuare il Primo Commit

### 5.1 Aggiungere i File a Git

```bash
# Aggiungi tutti i file
git add .

# Verifica cosa sarà commitato
git status
```

Dovresti vedere tutti i file come "new file".

### 5.2 Fare il Commit

```bash
git commit -m "Initial commit: Energy Monitor Card v1.0.0"
```

### 5.3 Push su GitHub

```bash
git push origin main
```

Se ti chiede l'autenticazione:
- **Username**: il tuo username GitHub
- **Password**: il tuo personal access token

### Come Generare il Personal Access Token

Se non lo hai:
1. Vai su https://github.com/settings/tokens
2. Clicca **Generate new token**
3. Nome: `github-cli`
4. Seleziona scopes: `repo`, `write:packages`
5. Clicca **Generate token**
6. **COPIA E SALVA** il token (non lo vedrai più)
7. Usalo come password quando Git lo chiede

## STEP 6: Creare una Release

### 6.1 Creare il Tag

```bash
# Crea un tag per la versione
git tag -a v1.0.0 -m "Release v1.0.0 - Initial Release"

# Pushua il tag su GitHub
git push origin v1.0.0
```

### 6.2 Creare la Release su GitHub

1. Vai su https://github.com/TUOUSERNAME/energy-monitor-card/releases
2. Clicca **Create a new release**
3. Compila il form:
   - **Tag version**: v1.0.0
   - **Release title**: "Energy Monitor Card v1.0.0"
   - **Description**:
   ```
   Initial release of Energy Monitor Card
   
   Features:
   - Real-time energy consumption monitoring
   - Temporal comparisons (previous day, week, month, year)
   - Automatic cost calculation
   - Auto-detection of energy sensors
   - Configuration UI editor
   - Responsive design (dark/light theme)
   - Total consumption summary
   
   Installation:
   - Install via HACS (Frontend)
   - Or manually: copy dist/ files to config/www/community/
   ```
4. Clicca **Publish release**

## STEP 7: Aggiungere a HACS

### 7.1 Verificare il Repository

Assicurati che:
- ✅ Repository è **PUBLIC**
- ✅ Contiene `manifest.json` nella root
- ✅ `manifest.json` ha il campo `version` uguale al tag
- ✅ File della card sono in `dist/`
- ✅ README.md esiste

### 7.2 Aggiungere a HACS Custom Repository

1. In Home Assistant, vai a **HACS** → **Tre puntini** → **Custom repositories**
2. Aggiungi:
   - **Repository URL**: `https://github.com/TUOUSERNAME/energy-monitor-card`
   - **Category**: Frontend
   - Clicca **Create**
3. Vai a **HACS** → **Frontend** → Dovresti vedere "Energy Monitor Card"
4. Clicca → **Install**

### 7.3 (Opzionale) Aggiungere al Repository Ufficiale HACS

Per apparire automaticamente in HACS senza "custom repository":

1. Vai su https://github.com/hacs/default
2. Clicca **Fork** (crea una copia tua)
3. Apri il file `repositories.json`
4. Aggiungi in fondo:
   ```json
   {
     "description": "Monitora i consumi energetici con confronti temporali",
     "domain": "energy-monitor-card",
     "documentation": "https://github.com/TUOUSERNAME/energy-monitor-card",
     "downloads": "https://github.com/TUOUSERNAME/energy-monitor-card/releases/latest/download/energy-monitor-card.zip",
     "homeassistant": "2023.12.0",
     "iot_class": "local_polling",
     "issues": "https://github.com/TUOUSERNAME/energy-monitor-card/issues",
     "name": "Energy Monitor Card",
     "render_process": [
       {
         "url": "/community_plugin/energy-monitor-card/dist/energy-monitor-card.js"
       }
     ],
     "repository": "https://github.com/TUOUSERNAME/energy-monitor-card",
     "version": "1.0.0"
   }
   ```
5. Fai un commit
6. Crea una Pull Request nel repository HACS

Nota: Il repository HACS esaminerà la PR e potrebbe chiedere modifiche.

## STEP 8: Testare l'Installazione

### 8.1 Installare Tramite HACS

1. Home Assistant → **HACS** → **Frontend**
2. Cerca **"Energy Monitor Card"**
3. Clicca **Install**
4. Riavvia Home Assistant

### 8.2 Testare la Card

1. Vai a **Dashboard** → **Create new tab**
2. Aggiungi una **Custom Card**
3. Seleziona **Energy Monitor Card**
4. Configura i dispositivi
5. Verifica che tutto funzioni

## STEP 9: Aggiornamenti Futuri

### 9.1 Fare Modifiche

Quando vuoi aggiornare la card:

```bash
# Modifica i file...

# Aggiungi al staging
git add .

# Commit
git commit -m "Description of changes"

# Push
git push origin main
```

### 9.2 Rilasciare Nuova Versione

```bash
# Crea nuovo tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Push
git push origin v1.1.0

# Crea release su GitHub (come al punto 6.2)
```

HACS controllerà automaticamente i nuovi tag e aggiornerà!

## 🐛 Troubleshooting

### "fatal: 'origin' does not appear to be a 'git' repository"

Assicurati di essere nella cartella corretta:
```bash
cd energy-monitor-card  # la cartella del progetto
```

### "Permission denied (publickey)"

Hai un problema con SSH. Usa HTTPS invece:
```bash
git remote set-url origin https://github.com/TUOUSERNAME/energy-monitor-card.git
```

### "manifest.json non trovato"

Assicurati che sia nella root della cartella, non in una sottocartella.

### La card non compare in HACS

1. Controlla che il repository sia PUBLIC
2. Verifica che manifest.json sia valido (JSON formatting)
3. Aspetta 24 ore affinché HACS la indicizzi
4. O aggiungila manualmente come "Custom Repository"

## ✅ Checklist Finale

Prima di pubblicare:

- [ ] Repository creato su GitHub
- [ ] Repository è PUBLIC
- [ ] `manifest.json` esiste e è valido
- [ ] `dist/` contiene i file JS
- [ ] `README.md` è presente e completo
- [ ] `LICENSE` è MIT
- [ ] `.gitignore` è configurato
- [ ] Almeno un commit fatto
- [ ] Tag di versione creato (v1.0.0)
- [ ] Release creata su GitHub
- [ ] Repository aggiunto a HACS (custom o ufficiale)
- [ ] Installazione testata in Home Assistant
- [ ] La card funziona correttamente

## 🎉 Fatto!

La tua Energy Monitor Card è ora disponibile su GitHub e pronta per HACS!

---

**Per domande**: Consulta la documentazione di GitHub e HACS
- GitHub Docs: https://docs.github.com
- HACS Docs: https://hacs.xyz
- Home Assistant: https://www.home-assistant.io
