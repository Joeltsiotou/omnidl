const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let analyses = [];

app.post('/analyze', (req, res) => {
    const data = req.body;
    
    // Calcul de la taille estimée (basé sur 24 minutes de vidéo)
    if (data.streams && data.streams.length > 0) {
        data.streams = data.streams.map(s => {
            const bitrateBps = parseInt(s.bw) || 0;
            // Formule : (Bitrate en bps * 1440 secondes) / 8 bits / 1024 / 1024 = Taille en Mo
            const estimatedSizeMo = ((bitrateBps * 1440) / 8 / 1024 / 1024).toFixed(0);
            return { ...s, size: estimatedSizeMo > 0 ? estimatedSizeMo + " Mo" : "Inconnue" };
        });
    }

    analyses.unshift(data);
    if (analyses.length > 20) analyses.pop();
    res.status(200).json({ status: 'success' });
});

app.get('/', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FLOCAP SYNTHESIS</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0f172a] text-slate-200 p-4 font-sans">
        <div class="max-w-2xl mx-auto">
            <div class="flex justify-between items-center mb-8 bg-[#1e293b] p-4 rounded-lg border border-slate-700">
                <h1 class="text-xl font-bold text-orange-500">FLOCAP <span class="text-white">SYNTHESIS</span></h1>
                <span class="text-[10px] bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 rounded">SERVEUR EN LIGNE</span>
            </div>

            <div class="space-y-4">
                ${analyses.map(a => `
                    <div class="bg-[#1e293b] border border-slate-700 rounded-xl p-5 shadow-2xl">
                        <h2 class="text-lg font-bold mb-3 text-white">${a.title}</h2>
                        <div class="bg-black/40 p-3 rounded text-[10px] font-mono text-slate-400 mb-4 break-all border border-white/5">
                            ${a.url}
                        </div>
                        
                        <div class="grid grid-cols-1 gap-3 mb-5">
                            ${a.streams.map(s => `
                                <div class="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                    <div>
                                        <span class="block text-orange-500 font-bold text-sm">${s.res}</span>
                                        <span class="text-[10px] text-slate-500">Poids est. : ${s.size}</span>
                                    </div>
                                    <a href="${a.url}" download="${a.title}_${s.res}.m3u8" class="bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold py-2 px-4 rounded-md transition-all">
                                        TÉLÉCHARGER
                                    </a>
                                </div>
                            `).join('')}
                        </div>

                        <div class="flex gap-2 border-t border-white/5 pt-4">
                            <button onclick="navigator.clipboard.writeText('${a.url}')" class="flex-1 bg-slate-700 text-[11px] py-2 rounded font-bold hover:bg-slate-600">COPIER URL</button>
                            <button onclick="window.open('${a.url}', '_blank')" class="flex-1 bg-slate-800 text-[11px] py-2 rounded font-bold hover:bg-slate-700 text-orange-400">LECTURE DIRECTE</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <script>setTimeout(() => location.reload(), 15000);</script>
    </body>
    </html>`;
    res.send(html);
});

app.listen(PORT, () => console.log('Station active'));
