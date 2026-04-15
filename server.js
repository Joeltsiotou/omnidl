const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage temporaire des analyses
let analyses = [];

// Route pour recevoir les données du bookmarklet
app.post('/analyze', (req, res) => {
    const data = req.body;
    console.log("Flux reçu :", data.title);
    
    // Ajout à l'historique (on garde les 20 derniers)
    analyses.unshift(data);
    if (analyses.length > 20) analyses.pop();
    
    res.status(200).json({ status: 'success', message: 'Synthèse reçue' });
});

// Interface Dashboard
app.get('/', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FLOCAP-SYNTHESIS</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-white font-sans p-4">
        <div class="max-w-4xl mx-auto">
            <header class="flex justify-between items-center border-b border-slate-700 pb-4 mb-8">
                <h1 class="text-2xl font-bold text-orange-500">FLOCAP <span class="text-white">SYNTHESIS</span></h1>
                <div class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/50">SERVEUR EN LIGNE</div>
            </header>

            <div id="list" class="space-y-4">
                ${analyses.length === 0 ? '<p class="text-slate-500 text-center">En attente de données depuis le Huawei...</p>' : ''}
                ${analyses.map(a => `
                    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="font-bold text-lg truncate flex-1">${a.title}</h2>
                            <span class="text-[10px] text-slate-500 ml-4">${new Date(a.ts).toLocaleTimeString()}</span>
                        </div>
                        <p class="text-xs text-slate-400 break-all mb-4 bg-black/30 p-2 rounded">${a.url}</p>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${a.streams.map(s => `
                                <span class="bg-orange-600 text-[10px] font-bold px-2 py-1 rounded">
                                    ${s.res} (${(s.bw / 1024 / 1024).toFixed(1)} Mbps)
                                </span>
                            `).join('')}
                        </div>

                        <div class="flex gap-2">
                            <button onclick="navigator.clipboard.writeText('${a.url}')" class="bg-slate-700 hover:bg-slate-600 text-xs py-2 px-4 rounded transition">Copier URL</button>
                            <a href="${a.url}" target="_blank" class="bg-orange-600 hover:bg-orange-500 text-xs py-2 px-4 rounded transition">Ouvrir Flux</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <script>setTimeout(() => location.reload(), 10000);</script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
