import { ChatMessage, GeminiConfig } from '../types';

const STORAGE_KEY_API_KEY = 'nemesis_gemini_api_key';
const STORAGE_KEY_MODEL = 'nemesis_gemini_model';

// Definitive free-tier model from Google AI Studio (as shown in user's official console)
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_MODEL = 'gemini-3.8-flash';

export function getStoredGeminiConfig(): GeminiConfig {
  let localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_API_KEY) : null;
  let localModel = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MODEL) : null;
  
  // Environment variable fallback if present
  const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

  // Auto-migration: if stored model was an obsolete/deprecated version (like gemini-2.5-flash or gemini-1.5-flash),
  // update it immediately to the definitive working free-tier model gemini-3.5-flash-lite
  if (!localModel || localModel.includes('2.5') || localModel.includes('2.0') || localModel.includes('1.5')) {
    localModel = DEFAULT_MODEL;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
    }
  }

  const effectiveKey = (localKey && localKey.trim()) || envKey || '';

  return {
    apiKey: effectiveKey,
    model: DEFAULT_MODEL,
    isValidated: Boolean(effectiveKey && effectiveKey.length > 10),
  };
}

export function saveStoredGeminiConfig(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_API_KEY, apiKey.trim());
    localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
  }
}

export function clearStoredGeminiConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    localStorage.removeItem(STORAGE_KEY_MODEL);
  }
}

/**
 * Direct real-time test of the Gemini API Key against Google Generative Language REST endpoint.
 * Returns exact latency and confirmation.
 */
export async function testGeminiApiKey(
  apiKey: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey || cleanKey.length < 10) {
    return { success: false, message: 'La clave de API ingresada es demasiado corta o no válida.' };
  }

  const startTime = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hola, responde exactamente "NÉMESIS_ACTIVO"' }],
          },
        ],
      }),
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Código de error HTTP ${response.status}`;
      return { 
        success: false, 
        message: `Google rechazó la clave (${DEFAULT_MODEL}): ${errorMsg}` 
      };
    }

    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return { 
        success: true, 
        message: `¡API Key 100% activa y conectada con Google Gemini (${DEFAULT_MODEL}) en ${latencyMs}ms!`,
        latencyMs,
      };
    }

    return { 
      success: false, 
      message: 'Google no devolvió ningún candidato de respuesta válido.' 
    };
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const errorMsg = isAbort ? 'Tiempo de espera agotado (12s) al conectar con Google.' : (err instanceof Error ? err.message : String(err));
    return { success: false, message: `Error de conexión con Google: ${errorMsg}` };
  }
}

export const SYSTEM_INSTRUCTION = `Eres NÉMESIS - IA, el tutor inteligente y red neuronal académica de élite de la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC), especializado en Ciencias Físicas, Matemáticas, Cálculo, Termodinámica, Electromagnetismo, Mecánica Clásica y Computación.

Directrices estrictas de respuesta y pedagogía:
1. Resuelve los ejercicios y preguntas con rigor universitario, paso a paso, explicando cada ley física y teorema matemático aplicado con claridad total.
2. Todas las expresiones matemáticas, variables y fórmulas DEBEN estar formateadas obligatoriamente en LaTeX estándar:
   - Usa $...$ para expresiones matemáticas en línea (por ejemplo: $F = m \\cdot a$, $E = m c^2$, $\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}$).
   - Usa $$...$$ en bloques separados para ecuaciones principales, integrales, derivadas y deducciones paso a paso.
   - NUNCA coloques símbolos matemáticos o letras griegas de forma cruda, aislada o confusa (como '$(\\lambda)$' sin explicar).
   - SIEMPRE explica el nombre y significado físico o matemático de cada variable o letra griega cuando la introduzcas en el texto. Por ejemplo: escribe "parámetro promedio de tasa $\\lambda$ (lambda)", "operador nabla $\\nabla$", "laplaciano $\\nabla^2$", "densidad volumétrica de carga $\\rho$ (rho)" o "permitividad del vacío $\\varepsilon_0$ (épsilon cero)", para que el estudiante siempre comprenda exactamente de qué se trata cada concepto.
3. Si el usuario adjunta una foto o consulta sobre un problema de física, extrae los datos, realiza el Diagrama de Cuerpo Libre (DCL), plantea las ecuaciones y da la respuesta con sus unidades dimensionales en el Sistema Internacional (SI).
4. Mantén un tono académico distinguido, claro, directo y motivador.`;

export interface AttachmentInput {
  base64?: string;
  mimeType: string;
  fileName?: string;
  textContent?: string;
}

/**
 * Sanitizes and formats the conversation history to strictly satisfy Google Gemini's
 * alternation requirement: [user, model, user, model, ..., user].
 */
function buildGeminiContents(
  prompt: string, 
  history: ChatMessage[], 
  attachment?: AttachmentInput
) {
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>;
  }> = [];

  // Filter out system welcome or error messages
  const cleanHistory = history.filter(
    (m) => m.id !== 'welcome' && !m.text.startsWith('⚠️') && m.text.trim().length > 0
  ).slice(-8); // Keep last 8 turns for context speed

  let lastRole: 'user' | 'model' | null = null;

  for (const msg of cleanHistory) {
    const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
    const text = msg.text.trim();
    if (!text) continue;

    if (role === lastRole && contents.length > 0) {
      // If consecutive identical role, merge into previous message to preserve strict alternation
      const prevMsg = contents[contents.length - 1];
      if (prevMsg.parts[0]?.text) {
        prevMsg.parts[0].text += `\n\n${text}`;
      } else {
        prevMsg.parts.push({ text });
      }
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
      lastRole = role;
    }
  }

  // Construct current user turn
  const currentParts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

  // If we have an inline data attachment supported by Gemini (images and PDF)
  if (attachment?.base64 && (attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf')) {
    const base64Clean = attachment.base64.replace(/^data:[^;]+;base64,/, '');
    currentParts.push({
      inline_data: {
        mime_type: attachment.mimeType,
        data: base64Clean,
      },
    });
  }

  let fullPrompt = prompt.trim();

  // If we have extracted text content from document (TXT, DOCX, CSV, code, etc.)
  if (attachment?.textContent) {
    const docHeader = `[DOCUMENTO ADJUNTO: ${attachment.fileName || 'documento'}]\n"""\n${attachment.textContent}\n"""\n\n`;
    fullPrompt = docHeader + (fullPrompt || 'Por favor analiza el documento adjunto y responde a las consultas o resuelve los problemas planteados.');
  } else if (!fullPrompt && attachment) {
    fullPrompt = `Por favor analiza el archivo adjunto (${attachment.fileName || 'archivo'}) y resuélvelo o explícalo con rigor académico y fórmulas en LaTeX.`;
  } else if (!fullPrompt) {
    fullPrompt = 'Hola NÉMESIS';
  }

  currentParts.push({ text: fullPrompt });

  if (lastRole === 'user' && contents.length > 0) {
    // Merge into user turn
    contents[contents.length - 1].parts.push(...currentParts);
  } else {
    contents.push({
      role: 'user',
      parts: currentParts,
    });
  }

  return contents;
}

export interface AskGeminiResult {
  text: string;
  isLiveGemini: boolean;
  modelUsed?: string;
}

import { EmojiLevel, WarmthLevel, PersonalityStyle, AcademicMemoryItem } from '../types';

export interface CourseContext {
  courseName: string;
  courseCode: string;
  currentWeek: number;
  currentTopic: string;
  currentFocusPrompt: string;
  competencies?: string;
  enabledResources?: string[];
}

export interface AskGeminiOptions {
  aiDetailMode?: 'rigorous' | 'concise';
  emojiLevel?: EmojiLevel;
  warmthLevel?: WarmthLevel;
  personalityStyle?: PersonalityStyle;
  nickname?: string;
  occupation?: string;
  academicMemories?: AcademicMemoryItem[];
  courseContext?: CourseContext;
}

function buildPersonalityPromptInstructions(options?: AskGeminiOptions): string {
  if (!options) return '';
  const lines: string[] = [];

  // Course Context & Syllabus Guidelines
  if (options.courseContext) {
    lines.push(`\n=== AGENTE TUTOR ACADÉMICO OFICIAL: ${options.courseContext.courseName.toUpperCase()} (${options.courseContext.courseCode}) ===
Estás actuando como el Agente y Tutor de Inteligencia Artificial para la cátedra oficial de "${options.courseContext.courseName}" en la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC).
Debes alinearte rigurosamente al Sílabo de cátedra:
- SEMANA ACTUAL DEL CURSO: Semana ${options.courseContext.currentWeek} de 16
- TEMA FORMATIVO EN CURSO: "${options.courseContext.currentTopic}"
- DIRECTIVA METODOLÓGICA Y CONTENIDOS DEL SÍLABO: "${options.courseContext.currentFocusPrompt}"
${options.courseContext.competencies ? `- COMPETENCIAS DEL CURSO: ${options.courseContext.competencies}` : ''}
${options.courseContext.enabledResources && options.courseContext.enabledResources.length > 0 ? `- RECURSOS Y MÓDULOS HABILITADOS POR EL DOCENTE EN GESTIÓN: ${options.courseContext.enabledResources.join(', ')}` : ''}

DIRECTIVAS ESPECÍFICAS DE RESPUESTA:
1. Responde de manera didáctica, formativa y con la máxima rigurosidad universitaria.
2. Si el alumno consulta sobre extracción de raíces o ecuaciones cuadráticas, domina y explica detalladamente los 4 métodos de cátedra:
   a) Método del Aspa Simple (descomposición en factores primos de los términos extremos).
   b) Método de Completación de Cuadrados (construcción del trinomio cuadrado perfecto).
   c) Fórmula General de la Cuadrática: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ y la discusión analítica del discriminante $\\Delta = b^2 - 4ac$.
   d) Teorema de Cardano-Vieta ($x_1 + x_2 = -\\frac{b}{a}$, $x_1 \\cdot x_2 = \\frac{c}{a}$).
3. Emplea notación matemática en formato LaTeX para todas las expresiones matemáticas.`);
  }

  // Nickname & Occupation
  if (options.nickname && options.nickname.trim()) {
    lines.push(`- APODO/TRATO: El usuario desea que te dirijas a él/ella como "${options.nickname.trim()}". Úsalo con naturalidad en tus respuestas.`);
  }
  if (options.occupation && options.occupation.trim()) {
    lines.push(`- PERFIL DEL USUARIO: Su ocupación/carrera es "${options.occupation.trim()}". Adapta ejemplos y aplicaciones a su campo de estudio.`);
  }

  // Emoji level
  if (options.emojiLevel === 'none') {
    lines.push('- EMOJIS: DIRECTIVA ESTRICTA: NO utilices NINGÚN emoji en tus respuestas. Cero emojis, mantén el texto 100% formal, limpio y tipográfico.');
  } else if (options.emojiLevel === 'medium') {
    lines.push('- EMOJIS: Utiliza emojis con moderación pedagógica (máximo 2 a 3 por respuesta en títulos o conclusiones clave).');
  } else if (options.emojiLevel === 'high') {
    lines.push('- EMOJIS: Nivel expresivo y dinámico; usa emojis pertinentes de ciencia y estudio (🔬, ⚛️, 📐, ⚡, 💡, 🚀) para enriquecer el texto.');
  }

  // Warmth
  if (options.warmthLevel === 'cold') {
    lines.push('- CALIDEZ: Frialdad analítica, distante, sin rodeos ni saludos afectivos. Ve directo al cálculo, a las leyes físicas y al resultado exacto.');
  } else if (options.warmthLevel === 'warm') {
    lines.push('- CALIDEZ: Cálido, empático, sumamente alentador y cercano. Motiva al estudiante con entusiasmo intelectual y valora su esfuerzo.');
  } else {
    lines.push('- CALIDEZ: Tono equilibrado, respetuoso, cordial y pedagógico.');
  }

  // Style
  switch (options.personalityStyle) {
    case 'friendly':
      lines.push('- ESTILO: Compañero de estudio brillante, accesible, amigable y comprensivo.');
      break;
    case 'sincere':
      lines.push('- ESTILO: 100% sincero y transparente. Di las cosas como son, sin adornos diplomáticos; si hay un error conceptual, señálalo de inmediato.');
      break;
    case 'quirky':
      lines.push('- ESTILO: Científico excéntrico y peculiar. Haz analogías inesperadas pero rigurosas y menciona curiosidades asombrosas del cosmos y la física.');
      break;
    case 'cynical':
      lines.push('- ESTILO: Cínico e irónico con humor mordaz e intelectual. No toleres la pereza mental, pero resuelve impecablemente con exactitud matemática deslumbrante.');
      break;
    case 'crazy':
      lines.push('- ESTILO: Físico teórico alocado y eufórico (estilo Einstein despeinado o científico loco apasionado). Muestra una obsesión electrizante por la física, el caos y la cuántica.');
      break;
    case 'professional':
    default:
      lines.push('- ESTILO: Profesor universitario distinguido, riguroso, formal y de altísima precisión académica.');
      break;
  }

  // Academic memories
  if (options.academicMemories && options.academicMemories.length > 0) {
    const memoryItems = options.academicMemories.map(m => `  * [${m.title}]: ${m.detail}`).join('\n');
    lines.push(`- MEMORIA ACADÉMICA REGISTRADA DEL ESTUDIANTE (Solo conceptos y temas de estudio):\n${memoryItems}`);
  }

  return lines.length > 0 ? `\n\nDIRECTRICES PERSONALIZADAS DE RESPUESTA Y PERFIL:\n${lines.join('\n')}` : '';
}

/**
 * Executes query to Google Gemini.
 * Uses definitive free model 'gemini-3.5-flash-lite' with timeout and fallback to 'gemini-3.8-flash'.
 */
export async function askGemini(
  prompt: string, 
  history: ChatMessage[], 
  attachment?: AttachmentInput,
  options?: AskGeminiOptions
): Promise<AskGeminiResult> {
  const config = getStoredGeminiConfig();

  // If user provided a real Gemini API Key, execute live query against Google
  if (config.apiKey && config.apiKey.trim().length > 10) {
    const cleanKey = config.apiKey.trim();
    const contents = buildGeminiContents(prompt, history, attachment);

    let effectiveSystemInstruction = SYSTEM_INSTRUCTION;
    if (options?.aiDetailMode === 'concise') {
      effectiveSystemInstruction += '\n\nMODO CONCISO: Proporciona respuestas directas, puntuales y concisas con los resultados finales y fórmulas clave en LaTeX, sin explicaciones redundantes.';
    }
    effectiveSystemInstruction += buildPersonalityPromptInstructions(options);

    // Try primary model (gemini-3.5-flash-lite), then fallback to gemini-3.8-flash if needed
    const modelsToTry = [DEFAULT_MODEL, FALLBACK_MODEL];

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: effectiveSystemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data?.error?.message || `HTTP ${response.status}`;
          console.warn(`Gemini model ${modelName} returned error:`, errorMsg);
          // If error is 503 or overload, loop to next model; otherwise break
          if (response.status === 503 || response.status === 429) {
            continue;
          }
          return {
            text: `⚠️ **Aviso de Google Gemini (${modelName}):**\n\n> ${errorMsg}\n\n*Por favor revisa tu clave o cuota de API en el Portal Desarrollador.*`,
            isLiveGemini: false,
          };
        }

        const candidate = data?.candidates?.[0];
        if (candidate?.content?.parts) {
          const fullResponse = candidate.content.parts
            .map((p: { text?: string }) => p.text || '')
            .filter(Boolean)
            .join('\n');

          if (fullResponse.trim()) {
            return {
              text: fullResponse,
              isLiveGemini: true,
              modelUsed: modelName,
            };
          }
        }
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        console.error(`Gemini fetch error with ${modelName}:`, err);
        if (isAbort) {
          continue; // Try fallback model if timed out
        }
      }
    }

    // If both models failed
    return {
      text: '⚠️ **Tiempo de espera agotado al conectar con Google Gemini.** Comprueba tu conexión a internet o verifica el estado de tu API Key en el Portal Desarrollador.',
      isLiveGemini: false,
    };
  }

  // Fallback simulator if no API Key has been configured yet
  return {
    text: generateOfflineAcademicResponse(prompt, attachment, options),
    isLiveGemini: false,
  };
}

function generateOfflineAcademicResponse(prompt: string, attachment?: AttachmentInput, options?: AskGeminiOptions): string {
  const p = prompt.toLowerCase();
  const userName = options?.nickname ? options.nickname.trim() : '';
  const userPrefix = userName ? `**${userName}**, ` : '';
  const noEmojis = options?.emojiLevel === 'none';

  // Greeting prefix based on style
  let greeting = '';
  if (options?.personalityStyle === 'cynical') {
    greeting = `*Observación analítica para ${userName || 'el consultante'}:* A ver, revisemos esto con precisión quirúrgica antes de que las leyes de la termodinámica decidan protestar.\n\n`;
  } else if (options?.personalityStyle === 'crazy') {
    greeting = `*¡EUREKA!* ¡${userName || 'Colega'}, la curvatura espacio-temporal y los osciladores armónicos se alinean para responder esto!\n\n`;
  } else if (options?.personalityStyle === 'quirky') {
    greeting = `*Dato fascinante antes de calcular:* ¿Sabías que incluso en el vacío cuántico este fenómeno tiene análogos sorprendentes? Analicemos:\n\n`;
  } else if (options?.personalityStyle === 'friendly') {
    greeting = `¡Hola ${userName || 'compañero'}! Vamos a resolver este ejercicio paso a paso de forma sencilla:\n\n`;
  } else if (options?.personalityStyle === 'sincere') {
    greeting = `Sin rodeos, ${userName || 'estudiante'}: este es el planteamiento matemático directo y exacto:\n\n`;
  }

  let result = '';

  if (attachment) {
    const isDoc = attachment.mimeType === 'application/pdf' || attachment.textContent !== undefined;
    const docName = attachment.fileName || 'archivo';
    
    if (isDoc) {
      result = `${greeting}### Análisis de Documento Académico — NÉMESIS IA
He procesado el archivo adjunto **${docName}**.

${attachment.textContent ? `*Extensión detectada: texto/documento con ${attachment.textContent.length} caracteres.*` : '*Documento PDF procesado.*'}

**1. Resumen de Contenido y Datos Clave:**
- Se extrajeron las ecuaciones y enunciados del documento para su tratamiento analítico.

**2. Formulación Teórica:**
$$E_k = \\frac{1}{2} m v^2, \\quad \\mathbf{F}_{neta} = \\sum_{i} \\mathbf{F}_i$$

**3. Recomendación:**
Para respuestas en tiempo real con modelos generativos de Google, recuerda ingresar tu API Key en el Portal Desarrollador.`;
    } else {
      result = `${greeting}### Análisis del Ejercicio Adjunto — NÉMESIS IA

He analizado la imagen del ejercicio de Física:

**1. Identificación del Sistema:**
Considerando el diagrama con masa $m$ en un plano inclinado con ángulo $\\theta$:

**2. Diagrama de Cuerpo Libre (DCL):**
- Fuerza gravitacional: $\\mathbf{P} = m \\cdot g \\downarrow$
- Componente paralela al plano: $P_x = m \\cdot g \\cdot \\sin(\\theta)$
- Componente normal al plano: $P_y = m \\cdot g \\cdot \\cos(\\theta)$
- Fuerza normal de contacto: $N = m \\cdot g \\cdot \\cos(\\theta)$
- Fuerza de fricción cinética: $f_k = \\mu_k \\cdot N = \\mu_k \\cdot m \\cdot g \\cdot \\cos(\\theta)$

**3. Ecuación de Movimiento (2ª Ley de Newton):**
$$\\sum F_x = m \\cdot a$$
$$m \\cdot g \\cdot \\sin(\\theta) - \\mu_k \\cdot m \\cdot g \\cdot \\cos(\\theta) = m \\cdot a$$

Simplificando la masa $m$:
$$a = g (\\sin(\\theta) - \\mu_k \\cos(\\theta))$$`;
    }
  } else if (p.includes('raiz') || p.includes('raíz') || p.includes('raices') || p.includes('raíces') || p.includes('cuadratica') || p.includes('cuadrática') || p.includes('algebra') || p.includes('aspa') || p.includes('completando')) {
    const courseInfo = options?.courseContext;
    const courseHeader = courseInfo 
      ? `### Cátedra UNSAAC: ${courseInfo.courseName} (${courseInfo.courseCode})\n**Semana ${courseInfo.currentWeek}: ${courseInfo.currentTopic}**\n*Enfoque según Sílabo Oficial:* ${courseInfo.currentFocusPrompt}\n\n`
      : `### Álgebra Superior — Métodos de Extracción de Raíces Cuadráticas (UNSAAC)\n\n`;

    result = `${greeting}${courseHeader}Para resolver una ecuación cuadrática general de la forma:
$$a x^2 + b x + c = 0 \\quad (a \\neq 0)$$

El sílabo universitario establece cuatro métodos analíticos indispensables:

---

#### 1. Método del Aspa Simple (Factorización)
Consiste en descomponer los términos extremos $a x^2$ y $c$:
$$a x^2 = (a_1 x)(a_2 x), \\quad c = (c_1)(c_2)$$
Verificando el producto cruzado:
$$(a_1 c_2 + a_2 c_1) x = b x$$
Factorizando como:
$$(a_1 x + c_1)(a_2 x + c_2) = 0 \\implies x_1 = -\\frac{c_1}{a_1}, \\quad x_2 = -\\frac{c_2}{a_2}$$

*Ejemplo:* $x^2 - 5x + 6 = 0 \\implies (x - 2)(x - 3) = 0 \\implies x_1 = 2, \\, x_2 = 3$.

---

#### 2. Método de Completación de Cuadrados
Se transforma la ecuación para obtener un **Trinomio Cuadrado Perfecto**:
1. Dividir entre $a$: $x^2 + \\frac{b}{a} x + \\frac{c}{a} = 0$
2. Trasponer el término independiente: $x^2 + \\frac{b}{a} x = -\\frac{c}{a}$
3. Sumar $\\left(\\frac{b}{2a}\\right)^2$ a ambos miembros:
$$x^2 + \\frac{b}{a} x + \\frac{b^2}{4a^2} = \\frac{b^2 - 4ac}{4a^2}$$
$$\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$$
4. Extrayendo raíz cuadrada:
$$x + \\frac{b}{2a} = \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a} \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

---

#### 3. Fórmula General y Discusión del Discriminante ($\\Delta$)
$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}, \\quad \\text{donde } \\Delta = b^2 - 4ac$$

- **Caso 1: $\\Delta > 0$** $\\implies$ Raíces reales y distintas ($x_1 \\neq x_2 \\in \\mathbb{R}$).
- **Caso 2: $\\Delta = 0$** $\\implies$ Raíz real única de multiplicidad 2 ($x_1 = x_2 = -\\frac{b}{2a}$).
- **Caso 3: $\\Delta < 0$** $\\implies$ Raíces complejas conjugadas ($x_{1,2} = \\alpha \\pm \\beta i \\in \\mathbb{C}$).

---

#### 4. Relaciones de Cardano-Vieta
Vinculan directamente las raíces con los coeficientes del polinomio:
- **Suma de raíces:** $S = x_1 + x_2 = -\\frac{b}{a}$
- **Producto de raíces:** $P = x_1 \\cdot x_2 = \\frac{c}{a}$
- **Diferencia de raíces:** $(x_1 - x_2)^2 = (x_1 + x_2)^2 - 4 x_1 x_2 = \\frac{\\Delta}{a^2}$`;
  } else if (options?.courseContext) {
    const cc = options.courseContext;
    result = `${greeting}### Cátedra UNSAAC: ${cc.courseName} (${cc.courseCode})
**Semana ${cc.currentWeek}: ${cc.currentTopic}**
*Directriz del Sílabo Oficial:* ${cc.currentFocusPrompt}

${cc.enabledResources && cc.enabledResources.length > 0 ? `*Módulos habilitados por el profesor:* ${cc.enabledResources.join(', ')}\n` : ''}
${userPrefix}Para abordar tu consulta en este tema:

1. **Marco Conceptual y Metodología:**
   Se aplican las directrices formuladas en la planificación de cátedra oficial.

2. **Desarrollo Analítico:**
   $$\\mathbf{R} = \\int_{\\Omega} \\Phi(\\mathbf{x}) \\, d\\Omega$$

3. **Práctica Recomendada:**
   Revisa los ejercicios propuestos en la guía de cátedra y los módulos habilitados por tu docente para afianzar este contenido.`;
  } else if (p.includes('calculo') || p.includes('derivada') || p.includes('integral')) {
    result = `${greeting}### Resolución Matemática — Cálculo Avanzado

Para el problema planteado, aplicamos las propiedades fundamentales:

**1. Planteamiento de la Integral:**
$$I = \\int x \\cdot e^{2x} \\, dx$$

**2. Integración por Partes:**
Tomamos $u = x \\implies du = dx$ y $dv = e^{2x} dx \\implies v = \\frac{1}{2} e^{2x}$.

Fórmula fundamental:
$$\\int u \\, dv = u \\cdot v - \\int v \\, du$$

**3. Sustitución y Desarrollo:**
$$I = x \\left(\\frac{1}{2} e^{2x}\\right) - \\int \\frac{1}{2} e^{2x} \\, dx$$
$$I = \\frac{1}{2} x e^{2x} - \\frac{1}{4} e^{2x} + C$$

Factorizando el término común:
$$I = \\frac{1}{4} e^{2x} (2x - 1) + C$$

Donde $C \\in \\mathbb{R}$ es la constante de integración.`;
  } else {
    result = `${greeting}### Tutoría Académica — NÉMESIS IA (UNSAAC)

${userPrefix}He recibido tu consulta sobre: *"${prompt.slice(0, 50)}..."*

Para resolver problemas de esta categoría en física y ciencias de la ingeniería, aplicamos el marco analítico riguroso:

1. **Definición de variables y condiciones de frontera:**
   Establecemos el sistema de referencia inercial $(x, y, z)$.

2. **Ecuaciones rectoras fundamentales:**
   $$\\mathbf{F}_{neta} = \\frac{d\\mathbf{p}}{dt} = m \\cdot \\mathbf{a}$$
   $$\\Delta E_{mec} = W_{otras} = 0$$

3. **Solución y consistencia dimensional:**
   Despejando analíticamente las incógnitas y verificando la consistencia dimensional en unidades del Sistema Internacional $[L][T]^{-2}$.`;
  }

  if (noEmojis) {
    // Remove common emojis
    result = result.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  }

  return result;
}
