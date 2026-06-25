// ───────────────────────────────────────────────────────────────
//  Función Serverless — Pre-evaluación de sonrisa con IA
//  Plataforma: VERCEL  (carpeta /api  →  ruta /api/analyze-smile)
//
//  Recibe:  POST { image: "<base64 SIN el prefijo data:...>" }
//  Devuelve: { text: "orientación..." }  ó  { error: "..." }
//
//  La clave secreta vive SOLO en el servidor (variable de entorno
//  ANTHROPIC_API_KEY). Nunca se expone al navegador.
// ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un asistente de orientación dental del consultorio de la Dra. Martha Estrada, especialista en odontología infantil y ortopedia maxilar en Cali. Una madre o padre envió una foto de la sonrisa de su hijo/a para una primera orientación.

Da una orientación CÁLIDA, BREVE y NO DIAGNÓSTICA en español, dirigida a la madre/padre, basada SOLO en lo visible en la foto.

Reglas estrictas:
- NO des diagnóstico definitivo ni afirmes condiciones clínicas con certeza. Usa lenguaje suave: "se observa", "podría", "vale la pena revisar".
- NO prometas resultados ni curas. Aclara que solo una evaluación presencial con la Dra. Martha puede confirmar.
- Comenta únicamente aspectos dentales visibles (alineación, espacios entre dientes, color, encías, mordida aparente). No comentes sobre ningún otro aspecto de la persona ni su apariencia general.
- Menciona de forma natural cuál(es) de estos servicios podrían ser relevantes: Odontología Infantil, Ortopedia Maxilar, Ortodoncia Preventiva, Higiene Oral Infantil.
- Tono tranquilizador, positivo y apto para una familia.
- Si la imagen NO muestra con claridad la sonrisa o los dientes de un niño/a, responde amablemente que necesitas una foto clara, de frente, sonriendo y mostrando los dientes, y NO inventes observaciones.
- Extensión: 110 a 170 palabras.
- Estructura: un saludo breve, 2-3 observaciones suaves, qué servicio(s) podrían ayudar, y una invitación a agendar la evaluación. Sin encabezados.
- Texto plano (sin markdown), pero puedes resaltar 2 o 3 frases clave envolviéndolas entre asteriscos dobles, **así**.`;

export default async function handler(req, res) {
  // CORS básico (útil si haces pruebas locales; en producción es mismo origen)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const image = body.image;
    if (!image) return res.status(400).json({ error: 'Falta la imagen.' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en el servidor.' });

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': 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,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: 'Aquí está la foto de la sonrisa de mi hijo/a. Por favor dame una orientación inicial.' }
          ]
        }]
      })
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text();
      console.error('Anthropic API error:', apiRes.status, detail);
      return res.status(502).json({ error: 'El servicio de IA no respondió correctamente.' });
    }

    const data = await apiRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
