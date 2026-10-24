export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST para gerar um roteiro." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "A IA ainda não foi configurada. Na Vercel, adicione GEMINI_API_KEY nas Environment Variables e publique novamente."
    });
  }

  try {
    const body = req.body || {};
    const series = body.series || {};
    const characters = Array.isArray(body.characters) ? body.characters.slice(0, 10) : [];
    const episodeNumber = Math.max(1, Math.min(999, Number(body.episodeNumber) || 1));
    const title = String(body.title || "").slice(0, 140);
    const direction = String(body.direction || "").slice(0, 3000);
    const continuity = String(body.continuity || "").slice(0, 10000);

    if (!String(series.name || "").trim()) {
      return res.status(400).json({ error: "Informe o nome da série antes de gerar o roteiro." });
    }
    if (!characters.length) {
      return res.status(400).json({ error: "Selecione pelo menos um personagem para este episódio." });
    }

    const prompt = `
Você é roteirista principal do FrutaVerse AI, especializado em séries originais com frutas antropomórficas em animação 3D cinematográfica. Escreva em português brasileiro natural, com diálogos fortes e ritmo de vídeo vertical.
Crie SOMENTE o roteiro do episódio solicitado, sem alegar que um vídeo foi gerado.
Mantenha rigorosamente a identidade dos personagens e a continuidade. Não contradiga fatos anteriores. Se for o episódio 1, apresente o universo e termine com um gancho intrigante.
A história deve ter começo, desenvolvimento, virada e gancho final; cada cena deve ter descrição visual filmável, ação clara e diálogo. Evite clichês vazios e repetições. Não use personagens além dos listados, salvo se a trama exigir alguém secundário sem nome.
Visual: animação 3D estilizada de alto nível, materiais de fruta detalhados, expressões faciais legíveis, iluminação cinematográfica, profundidade de campo, enquadramento vertical 9:16. Preserve a aparência descrita dos personagens em todas as cenas.
Série: ${JSON.stringify(series)}
Episódio número: ${episodeNumber}
Título provisório: ${title}
Direção desejada pelo criador: ${direction || "Crie uma abertura envolvente e surpreendente, coerente com a série."}
Personagens disponíveis: ${JSON.stringify(characters)}
Continuidade dos episódios anteriores: ${continuity || "Nenhum episódio anterior."}
Duração desejada: ${String(series.duration || "45–60 segundos")}
Gere entre 4 e 7 cenas, ajustadas à duração. Responda em JSON válido com exatamente estas chaves:
{
 "title": "título definitivo",
 "summary": "resumo conciso do episódio",
 "scenes": [
   {"title":"nome curto da cena","description":"descrição visual e ação, incluindo cenário, movimento, expressão, iluminação e enquadramento","dialogue":"diálogo com nome do personagem e falas em português brasileiro"}
 ],
 "cliffhanger": "gancho final que prepara o próximo episódio"
}
`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              summary: { type: "STRING" },
              scenes: { type: "ARRAY", items: { type: "OBJECT", properties: {
                title: { type: "STRING" }, description: { type: "STRING" }, dialogue: { type: "STRING" }
              }, required: ["title", "description", "dialogue"] } },
              cliffhanger: { type: "STRING" }
            },
            required: ["title", "summary", "scenes", "cliffhanger"]
          }
        }
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const message = data?.error?.message || "O provedor de IA recusou a solicitação.";
      return res.status(upstream.status === 429 ? 429 : 502).json({
        error: upstream.status === 429
          ? "Limite de uso da IA atingido. Aguarde um pouco e tente novamente."
          : "Falha no serviço de IA: " + message.slice(0, 220)
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!text) return res.status(502).json({ error: "A IA não retornou texto. Tente novamente." });
    let script;
    try { script = JSON.parse(text); } catch {
      return res.status(502).json({ error: "A IA retornou um formato inválido. Tente novamente." });
    }
    if (!Array.isArray(script.scenes) || script.scenes.length < 3) {
      return res.status(502).json({ error: "O roteiro retornado veio incompleto. Tente novamente." });
    }
    return res.status(200).json({ script, provider: "Gemini", model });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao gerar o roteiro. Tente novamente." });
  }
}
