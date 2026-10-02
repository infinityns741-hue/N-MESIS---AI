import React, { useMemo } from 'react';

export type TimeOfDay = 'day' | 'sunset' | 'night';

interface EnvironmentBackdropProps {
  timeOfDay: TimeOfDay;
}

export const EnvironmentBackdrop: React.FC<EnvironmentBackdropProps> = React.memo(({
  timeOfDay,
}) => {
  // Configuración cromática y de iluminación inspirada en las referencias (Ghibli + Realistic Mountain & Trees)
  const env = useMemo(() => {
    switch (timeOfDay) {
      case 'day':
        return {
          skyGradient: 'from-[#1a73e8] via-[#38bdf8] via-[#7dd3fc] to-[#e0f2fe]',
          cloudSun: '#ffffff',
          cloudMid: '#f1f5f9',
          cloudShadow: '#94a3b8',
          cloudGhibliShadow: '#64748b',
          // Montañas verdes estilo Ghibli y cónica (Imágenes 1 y 2)
          mountainForestGreen: '#14532d',
          mountainLushGreen: '#16a34a',
          mountainSlopeLight: '#4ade80',
          mountainRockGray: '#475569',
          mountainRockDark: '#1e293b',
          mountainRockHighlight: '#94a3b8',
          snowWhite: '#f8fafc',
          // Árboles (Imágenes 3 y 4)
          treeBarkDark: '#3e2723',
          treeBarkMid: '#5d4037',
          treeBarkLight: '#8d6e63',
          treeLeafDeep: '#0f3a1f',
          treeLeafMid: '#166534',
          treeLeafLight: '#22c55e',
          treeLeafSun: '#86efac',
          // Suelo y carretera
          grassColor: '#15803d',
          roadColor: '#1e293b',
          lineColor: '#ffffff',
          isNight: false,
          isSunset: false,
        };
      case 'sunset':
        return {
          skyGradient: 'from-[#311042] via-[#86198f] via-[#c2410c] to-[#fed7aa]',
          cloudSun: '#fde047',
          cloudMid: '#fbcfe8',
          cloudShadow: '#9d174d',
          cloudGhibliShadow: '#701a75',
          mountainForestGreen: '#3b250c',
          mountainLushGreen: '#854d0e',
          mountainSlopeLight: '#ca8a04',
          mountainRockGray: '#581c87',
          mountainRockDark: '#3b0764',
          mountainRockHighlight: '#d8b4fe',
          snowWhite: '#ffedd5',
          treeBarkDark: '#291409',
          treeBarkMid: '#451a03',
          treeBarkLight: '#78350f',
          treeLeafDeep: '#1e290f',
          treeLeafMid: '#3f6212',
          treeLeafLight: '#65a30d',
          treeLeafSun: '#facc15',
          grassColor: '#365314',
          roadColor: '#18181b',
          lineColor: '#fef08a',
          isNight: false,
          isSunset: true,
        };
      case 'night':
      default:
        return {
          skyGradient: 'from-[#020617] via-[#090f23] to-[#0f172a]',
          cloudSun: '#334155',
          cloudMid: '#1e293b',
          cloudShadow: '#0f172a',
          cloudGhibliShadow: '#090d16',
          mountainForestGreen: '#06281e',
          mountainLushGreen: '#0f3a2c',
          mountainSlopeLight: '#14532d',
          mountainRockGray: '#1e293b',
          mountainRockDark: '#0b1120',
          mountainRockHighlight: '#334155',
          snowWhite: '#64748b',
          treeBarkDark: '#1c1917',
          treeBarkMid: '#292524',
          treeBarkLight: '#44403c',
          treeLeafDeep: '#022c22',
          treeLeafMid: '#064e3b',
          treeLeafLight: '#047857',
          treeLeafSun: '#059669',
          grassColor: '#022c22',
          roadColor: '#090d1a',
          lineColor: '#cbd5e1',
          isNight: true,
          isSunset: false,
        };
    }
  }, [timeOfDay]);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-b ${env.skyGradient} select-none pointer-events-none transition-colors duration-1000`}>
      {/* =========================================================================
          1. CIELO Y ELEMENTOS CELESTES
          ========================================================================= */}
      {env.isNight ? (
        <>
          {/* Constelaciones y cielo estrellado */}
          <div className="absolute inset-0">
            <div className="absolute top-3 left-12 w-1.5 h-1.5 bg-white rounded-full opacity-90 animate-pulse shadow-[0_0_4px_#ffffff]" />
            <div className="absolute top-8 left-36 w-1 h-1 bg-sky-200 rounded-full opacity-70" />
            <div className="absolute top-5 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-85 animate-ping" />
            <div className="absolute top-12 left-1/3 w-1 h-1 bg-cyan-200 rounded-full opacity-60" />
            <div className="absolute top-4 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            <div className="absolute top-10 right-1/3 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse" />
            <div className="absolute top-3 right-1/4 w-1.5 h-1.5 bg-sky-100 rounded-full opacity-90" />
            <div className="absolute top-14 right-48 w-1 h-1 bg-cyan-100 rounded-full opacity-65" />
            <div className="absolute top-6 right-20 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
          </div>

          {/* Luna llena brillante */}
          <div className="absolute top-3 right-12 sm:right-24 flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-cyan-400/15 blur-2xl" />
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ffffff] via-[#f1f5f9] to-[#cbd5e1] shadow-[0_0_20px_rgba(255,255,255,0.85)] relative overflow-hidden border border-white/80">
              <div className="absolute top-2 left-2.5 w-3 h-3 rounded-full bg-slate-300/50" />
              <div className="absolute top-6 left-5 w-3.5 h-3.5 rounded-full bg-slate-400/40" />
              <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-slate-300/60" />
            </div>
          </div>
        </>
      ) : env.isSunset ? (
        <div className="absolute top-8 right-20 sm:right-32 flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-orange-500/30 blur-2xl" />
          <div className="absolute w-24 h-24 rounded-full bg-amber-400/40 blur-xl" />
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ea580c] via-[#f97316] to-[#fef08a] shadow-[0_0_40px_#ea580c]" />
        </div>
      ) : (
        <div className="absolute top-3 right-16 sm:right-28 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-yellow-300/30 blur-2xl animate-pulse" />
          <div className="absolute w-20 h-20 rounded-full bg-yellow-200/40 blur-lg" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#facc15] via-[#fde047] to-[#ffffff] shadow-[0_0_30px_#fde047]" />
        </div>
      )}

      {/* =========================================================================
          NUBES VOLUMÉTRICAS ESTILO STUDIO GHIBLI (Inspirado en Imagen 2)
          Grandes cúmulos esponjosos con billows redondeados, crestas iluminadas y sombras
          ========================================================================= */}
      <div className="absolute top-1 left-2 sm:left-10 opacity-95">
        <svg width="260" height="95" viewBox="0 0 260 95">
          <defs>
            <linearGradient id="ghibliCloud1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={env.cloudSun} />
              <stop offset="65%" stopColor={env.cloudMid} />
              <stop offset="100%" stopColor={env.cloudShadow} />
            </linearGradient>
            <filter id="cloudSoftBlur">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>
          {/* Masa principal de cúmulo con lóbulos orgánicos */}
          <path
            d="
              M 30 85 
              C 10 85 5 70 12 55 
              C 5 40 25 28 40 32 
              C 48 15 75 10 95 20 
              C 110 5 145 2 165 18 
              C 185 8 215 15 225 35 
              C 245 40 255 60 245 75 
              C 240 85 220 85 200 85 Z
            "
            fill="url(#ghibliCloud1)"
            filter="url(#cloudSoftBlur)"
          />
          {/* Sombras interiores volumétricas Ghibli */}
          <path
            d="M 25 75 Q 60 82 100 70 Q 140 80 190 72 Q 225 80 240 76 C 230 85 205 85 30 85 Z"
            fill={env.cloudGhibliShadow}
            opacity="0.35"
          />
          {/* Crestas superiores intensamente iluminadas */}
          <path
            d="M 45 28 Q 70 12 95 18 M 115 8 Q 140 5 162 16 M 185 12 Q 210 16 222 32"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Cúmulo Ghibli secundario a la derecha */}
      <div className="absolute top-4 right-4 sm:right-28 opacity-90 hidden sm:block">
        <svg width="220" height="80" viewBox="0 0 220 80">
          <path
            d="
              M 20 70 
              C 8 70 5 58 12 46 
              C 8 32 26 22 42 26 
              C 52 10 80 6 100 16 
              C 120 4 150 6 168 20 
              C 185 15 208 25 212 45 
              C 218 60 205 70 180 70 Z
            "
            fill="url(#ghibliCloud1)"
          />
          <path
            d="M 25 62 Q 70 70 120 60 Q 170 68 205 62 C 195 70 180 70 20 70 Z"
            fill={env.cloudGhibliShadow}
            opacity="0.3"
          />
        </svg>
      </div>

      {/* =========================================================================
          2. PAISAJE DE MONTAÑAS:
             - CENTRO: Montaña cónica frondosa ("MOUNTAIN", Imagen 1)
             - LATERALES: Cordillera Alpina estilo Ghibli con laderas verdes, riscos rocosos y cumbres (Imagen 2)
          ========================================================================= */}
      <div className="absolute bottom-20 left-0 right-0 h-52 flex items-end">
        <svg className="w-full h-full" viewBox="0 0 1400 240" preserveAspectRatio="none">
          <defs>
            {/* Gradiente de la montaña cónica central verde (Imagen 1) */}
            <linearGradient id="coneMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={env.mountainSlopeLight} />
              <stop offset="40%" stopColor={env.mountainLushGreen} />
              <stop offset="100%" stopColor={env.mountainForestGreen} />
            </linearGradient>

            {/* Gradiente ladera alpina izquierda (Imagen 2) */}
            <linearGradient id="alpineLeftGrad" x1="30%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={env.mountainSlopeLight} />
              <stop offset="50%" stopColor={env.mountainLushGreen} />
              <stop offset="100%" stopColor={env.mountainForestGreen} />
            </linearGradient>

            {/* Gradiente riscos rocosos de granito alpino */}
            <linearGradient id="rockCliffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={env.mountainRockHighlight} />
              <stop offset="50%" stopColor={env.mountainRockGray} />
              <stop offset="100%" stopColor={env.mountainRockDark} />
            </linearGradient>
          </defs>

          {/* CAPA 1 (FONDO LEJANO): Cumbres nevadas altas y riscos distantes */}
          <polygon
            points="
              0,240 0,130 80,105 160,135 240,85 340,120 460,70 560,110 
              680,45 800,105 920,60 1040,115 1160,75 1280,110 1400,80 1400,240
            "
            fill={env.mountainRockGray}
            opacity="0.5"
          />
          {/* Manchas de nieve alpina en picos altos lejanos */}
          <polygon points="240,85 220,105 240,100 255,108 260,95" fill={env.snowWhite} opacity="0.8" />
          <polygon points="460,70 435,95 460,90 480,98 485,85" fill={env.snowWhite} opacity="0.85" />
          <polygon points="680,45 640,80 675,75 690,70 710,82 725,75" fill={env.snowWhite} opacity="0.9" />
          <polygon points="920,60 890,85 920,80 940,88 950,78" fill={env.snowWhite} opacity="0.8" />
          <polygon points="1160,75 1135,95 1160,90 1180,98" fill={env.snowWhite} opacity="0.75" />

          {/* CAPA 2 (CORDILLERA GHIBLI DERECHA): Ladera escarpada con riscos de granito y praderas verdes (Imagen 2) */}
          <path
            d="M 750,240 L 820,120 L 920,65 L 1050,110 L 1180,50 L 1320,95 L 1400,60 L 1400,240 Z"
            fill="url(#rockCliffGrad)"
          />
          {/* Praderas verdes que caen por los riscos alpinos derechos */}
          <path
            d="M 820,120 Q 900,100 980,130 Q 1080,90 1180,125 Q 1280,85 1400,110 L 1400,240 L 780,240 Z"
            fill={env.mountainLushGreen}
            opacity="0.85"
          />
          {/* Parches de roca expuesta y cañones */}
          <polygon points="920,65 890,130 940,120" fill={env.mountainRockDark} opacity="0.6" />
          <polygon points="1180,50 1150,120 1210,110" fill={env.mountainRockDark} opacity="0.6" />
          <polygon points="1050,110 1020,165 1070,155" fill={env.mountainRockDark} opacity="0.5" />

          {/* CAPA 3 (MONTAÑA CÓNICA PRINCIPAL - "MOUNTAIN", Imagen 1):
              Majestuosa montaña cónica en el cuadrante central-izquierdo cubierta de bosques de árboles */}
          <path
            d="
              M 180,240 
              C 260,200 340,130 440,65 
              C 480,38 520,38 560,65 
              C 660,130 740,200 820,240 Z
            "
            fill="url(#coneMountainGrad)"
          />
          {/* Sombra volumétrica en la ladera derecha de la montaña cónica */}
          <path
            d="
              M 500,40 
              C 520,40 560,65 660,130 
              C 740,200 820,240 820,240 
              L 500,240 Z
            "
            fill={env.mountainForestGreen}
            opacity="0.45"
          />

          {/* Bosque de árboles en las laderas de la montaña cónica (copas redondas y pinos como en Imagen 1) */}
          {/* Cumbre y zona alta */}
          <circle cx="500" cy="42" r="7" fill={env.mountainForestGreen} />
          <circle cx="485" cy="50" r="9" fill={env.mountainLushGreen} />
          <circle cx="515" cy="50" r="9" fill={env.mountainForestGreen} />
          <circle cx="470" cy="65" r="11" fill={env.mountainLushGreen} />
          <circle cx="500" cy="62" r="13" fill={env.mountainSlopeLight} opacity="0.9" />
          <circle cx="530" cy="65" r="12" fill={env.mountainForestGreen} />
          {/* Nivel medio de la montaña cónica */}
          <circle cx="430" cy="95" r="14" fill={env.mountainLushGreen} />
          <circle cx="470" cy="90" r="16" fill={env.mountainSlopeLight} />
          <circle cx="510" cy="88" r="18" fill={env.mountainLushGreen} />
          <circle cx="550" cy="92" r="16" fill={env.mountainForestGreen} />
          <circle cx="590" cy="98" r="15" fill={env.mountainForestGreen} />
          {/* Nivel bajo de la montaña cónica */}
          <circle cx="370" cy="140" r="18" fill={env.mountainLushGreen} />
          <circle cx="420" cy="130" r="20" fill={env.mountainSlopeLight} />
          <circle cx="480" cy="125" r="22" fill={env.mountainLushGreen} />
          <circle cx="540" cy="125" r="22" fill={env.mountainForestGreen} />
          <circle cx="610" cy="135" r="20" fill={env.mountainForestGreen} />
          <circle cx="670" cy="145" r="18" fill={env.mountainForestGreen} />

          {/* CAPA 4: LADERA ALPINA IZQUIERDA ESTILO GHIBLI (Valle y pendiente verde, Imagen 2) */}
          <path
            d="
              M 0,240 L 0,80 
              C 60,85 120,110 200,140 
              C 280,170 340,195 450,220 
              L 450,240 Z
            "
            fill="url(#alpineLeftGrad)"
          />
          {/* Escarpe rocoso en la ladera izquierda */}
          <polygon points="0,80 30,120 70,110 50,150 120,145 0,165" fill={env.mountainRockDark} opacity="0.55" />
          <polygon points="12,85 30,115 65,108" fill={env.mountainRockHighlight} opacity="0.6" />

          {/* Arroyo alpino cristalino que desciende por el valle (como en Imagen 2) */}
          <path
            d="M 220,150 Q 240,175 270,195 Q 310,215 360,240"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 220,150 Q 240,175 270,195 Q 310,215 360,240"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="6,4"
            opacity="0.9"
          />

          {/* Colinas de primer plano onduladas con vegetación densa */}
          <path
            d="
              M 0,240 L 0,190 
              Q 180,160 360,185 
              Q 540,165 720,185 
              Q 900,160 1080,180 
              Q 1260,165 1400,185 L 1400,240 Z
            "
            fill={env.mountainLushGreen}
          />
        </svg>
      </div>

      {/* =========================================================================
          3. ÁRBOLES MAJESTUOSOS REALISTAS:
             - IZQUIERDA: Árbol Samán / Acacia de copa ancha estratificada (Imagen 4)
             - DERECHA: Gran Roble de copa redonda abovedada con raíces visibles (Imagen 3)
          ========================================================================= */}
      <div className="absolute bottom-20 left-0 right-0 h-40 pointer-events-none flex items-end justify-between px-2 sm:px-8 z-10">
        
        {/* =======================================================================
            ÁRBOL IZQUIERDA: SAMÁN / ACACIA DE SOMBRA EXPANSIVA (Inspirado en Imagen 4)
            - Tronco gnarled escultórico con bifurcaciones pesadas y raíces expuestas
            - Copa horizontal ancha en niveles escalonados (tiered canopy)
            ======================================================================= */}
        <div className="relative w-36 sm:w-48 md:w-56 h-40 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 240 170">
            <defs>
              <linearGradient id="trunkGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={env.treeBarkLight} />
                <stop offset="35%" stopColor={env.treeBarkMid} />
                <stop offset="100%" stopColor={env.treeBarkDark} />
              </linearGradient>
            </defs>

            {/* Raíces tabulares expuestas sobre la hierba (Imagen 4) */}
            <path
              d="M 85 170 Q 95 155 105 145 M 105 170 Q 115 155 120 140 M 145 170 Q 135 155 128 140 M 165 170 Q 150 155 135 145"
              stroke={env.treeBarkDark}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 88 170 Q 98 156 106 146 M 143 168 Q 134 156 128 142"
              stroke={env.treeBarkLight}
              strokeWidth="2"
              fill="none"
            />

            {/* Tronco robusto y ramas principales expansivas horizontales (Imagen 4) */}
            <path
              d="
                M 102 155 
                C 105 130 110 115 110 100 
                C 95 88 70 82 45 75 
                C 65 78 95 85 112 92 
                C 114 78 116 65 120 52 
                C 124 65 126 78 128 92 
                C 145 85 175 78 195 75 
                C 170 82 145 88 130 100 
                C 130 115 135 130 138 155 Z
              "
              fill="url(#trunkGrad4)"
            />

            {/* Ramificaciones secundarias que sostienen las bandejas de follaje */}
            <path d="M 65 77 Q 50 68 35 62" stroke={env.treeBarkMid} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 80 82 Q 72 70 60 60" stroke={env.treeBarkMid} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 160 82 Q 170 70 185 62" stroke={env.treeBarkMid} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 175 77 Q 190 68 205 62" stroke={env.treeBarkMid} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 120 62 Q 105 50 90 40" stroke={env.treeBarkMid} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 122 62 Q 135 50 150 40" stroke={env.treeBarkMid} strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* ESTRATOS DE FOLLAJE HORIZONTAL (Tiered Foliage Clusters, Imagen 4) */}
            {/* Nivel 1: Capa inferior izquierda */}
            <ellipse cx="40" cy="62" rx="30" ry="14" fill={env.treeLeafDeep} />
            <ellipse cx="38" cy="58" rx="26" ry="11" fill={env.treeLeafMid} />
            <ellipse cx="36" cy="54" rx="20" ry="8" fill={env.treeLeafLight} />
            <ellipse cx="34" cy="50" rx="14" ry="5" fill={env.treeLeafSun} opacity="0.8" />

            {/* Nivel 2: Capa inferior derecha */}
            <ellipse cx="200" cy="62" rx="30" ry="14" fill={env.treeLeafDeep} />
            <ellipse cx="198" cy="58" rx="26" ry="11" fill={env.treeLeafMid} />
            <ellipse cx="196" cy="54" rx="20" ry="8" fill={env.treeLeafLight} />
            <ellipse cx="194" cy="50" rx="14" ry="5" fill={env.treeLeafSun} opacity="0.8" />

            {/* Nivel 3: Flanco medio izquierdo */}
            <ellipse cx="75" cy="50" rx="34" ry="16" fill={env.treeLeafDeep} />
            <ellipse cx="73" cy="46" rx="30" ry="13" fill={env.treeLeafMid} />
            <ellipse cx="70" cy="42" rx="24" ry="10" fill={env.treeLeafLight} />
            <ellipse cx="68" cy="38" rx="16" ry="6" fill={env.treeLeafSun} opacity="0.85" />

            {/* Nivel 4: Flanco medio derecho */}
            <ellipse cx="165" cy="50" rx="34" ry="16" fill={env.treeLeafDeep} />
            <ellipse cx="163" cy="46" rx="30" ry="13" fill={env.treeLeafMid} />
            <ellipse cx="160" cy="42" rx="24" ry="10" fill={env.treeLeafLight} />
            <ellipse cx="158" cy="38" rx="16" ry="6" fill={env.treeLeafSun} opacity="0.85" />

            {/* Nivel 5: Gran cúpula central superior */}
            <ellipse cx="120" cy="36" rx="44" ry="20" fill={env.treeLeafDeep} />
            <ellipse cx="118" cy="30" rx="38" ry="16" fill={env.treeLeafMid} />
            <ellipse cx="115" cy="24" rx="30" ry="12" fill={env.treeLeafLight} />
            <ellipse cx="112" cy="18" rx="20" ry="7" fill={env.treeLeafSun} opacity="0.9" />
          </svg>
        </div>

        {/* Pinos andinos intermedios a media distancia */}
        <div className="relative w-12 sm:w-16 h-32 hidden lg:flex items-end">
          <svg className="w-full h-full" viewBox="0 0 60 120">
            <rect x="28" y="80" width="4" height="40" fill="#3e2723" />
            <polygon points="30,55 8,90 30,82 52,90" fill="#064e3b" />
            <polygon points="30,55 10,85 30,78 50,85" fill="#047857" opacity="0.9" />
            <polygon points="30,35 14,65 30,58 46,65" fill="#065f46" />
            <polygon points="30,35 16,60 30,55 44,60" fill="#059669" opacity="0.9" />
            <polygon points="30,15 20,40 30,35 40,40" fill="#10b981" />
          </svg>
        </div>

        {/* Arbustos con flores silvestres andinas (Retama dorada) */}
        <div className="relative w-14 sm:w-20 h-16 hidden md:flex items-end">
          <svg className="w-full h-full" viewBox="0 0 80 60">
            <ellipse cx="40" cy="40" rx="35" ry="18" fill="#166534" />
            <ellipse cx="38" cy="36" rx="28" ry="14" fill="#15803d" />
            <ellipse cx="36" cy="32" rx="20" ry="10" fill="#22c55e" opacity="0.8" />
            <circle cx="22" cy="30" r="2.5" fill="#facc15" />
            <circle cx="34" cy="24" r="2" fill="#fde047" />
            <circle cx="48" cy="26" r="2.5" fill="#facc15" />
            <circle cx="58" cy="32" r="2" fill="#fde047" />
          </svg>
        </div>

        {/* =======================================================================
            ÁRBOL DERECHA: GRAN ROBLE DE COPA ABOVEDADA (Inspirado en Imagen 3)
            - Tronco leñoso con textura de corteza y patas de raíz arraigadas al suelo
            - Fuerte ramaje visible que se extiende hacia arriba en abanico
            - Copa densa esférica con volumen de hojas y luces superiores
            ======================================================================= */}
        <div className="relative w-36 sm:w-48 md:w-56 h-40 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 220 170">
            <defs>
              <linearGradient id="trunkGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={env.treeBarkLight} />
                <stop offset="40%" stopColor={env.treeBarkMid} />
                <stop offset="100%" stopColor={env.treeBarkDark} />
              </linearGradient>
            </defs>

            {/* Base de raíces arraigadas en el césped (Imagen 3) */}
            <path
              d="M 80 170 Q 95 158 102 145 M 95 170 Q 105 158 110 142 M 140 170 Q 130 158 122 145 M 125 170 Q 120 158 116 142"
              stroke={env.treeBarkDark}
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 82 170 Q 96 159 103 146 M 138 170 Q 129 159 123 146"
              stroke={env.treeBarkLight}
              strokeWidth="2"
              fill="none"
            />

            {/* Tronco principal ancho con textura y separación en ramas maestras (Imagen 3) */}
            <path
              d="
                M 100 150 
                C 102 125 100 110 96 95 
                C 85 85 70 75 55 68 
                C 68 75 88 85 98 90 
                C 100 78 102 65 105 50 
                C 108 65 110 78 112 90 
                C 122 85 142 75 155 68 
                C 140 75 125 85 114 95 
                C 112 110 112 125 118 150 Z
              "
              fill="url(#trunkGrad3)"
            />

            {/* Líneas de textura de corteza en el tronco */}
            <path d="M 104 140 Q 106 120 102 105" stroke={env.treeBarkDark} strokeWidth="1.5" fill="none" />
            <path d="M 112 140 Q 114 122 110 108" stroke={env.treeBarkDark} strokeWidth="1.5" fill="none" />

            {/* COPA DÓMICA EXPANSA EN MÚLTIPLES LÓBULOS ESFÉRICOS (Imagen 3) */}
            {/* Lóbulo base inferior izquierdo */}
            <circle cx="65" cy="85" r="32" fill={env.treeLeafDeep} />
            <circle cx="62" cy="80" r="28" fill={env.treeLeafMid} />
            <circle cx="58" cy="74" r="22" fill={env.treeLeafLight} />
            <circle cx="54" cy="68" r="14" fill={env.treeLeafSun} opacity="0.85" />

            {/* Lóbulo base inferior derecho */}
            <circle cx="155" cy="85" r="32" fill={env.treeLeafDeep} />
            <circle cx="152" cy="80" r="28" fill={env.treeLeafMid} />
            <circle cx="148" cy="74" r="22" fill={env.treeLeafLight} />
            <circle cx="144" cy="68" r="14" fill={env.treeLeafSun} opacity="0.85" />

            {/* Lóbulos laterales medios */}
            <circle cx="45" cy="60" r="30" fill={env.treeLeafDeep} />
            <circle cx="42" cy="55" r="25" fill={env.treeLeafMid} />
            <circle cx="38" cy="50" r="18" fill={env.treeLeafLight} />
            <circle cx="35" cy="45" r="12" fill={env.treeLeafSun} opacity="0.85" />

            <circle cx="175" cy="60" r="30" fill={env.treeLeafDeep} />
            <circle cx="172" cy="55" r="25" fill={env.treeLeafMid} />
            <circle cx="168" cy="50" r="18" fill={env.treeLeafLight} />
            <circle cx="165" cy="45" r="12" fill={env.treeLeafSun} opacity="0.85" />

            {/* Lóbulos medios centrales */}
            <circle cx="85" cy="55" r="36" fill={env.treeLeafDeep} />
            <circle cx="82" cy="50" r="30" fill={env.treeLeafMid} />
            <circle cx="78" cy="44" r="24" fill={env.treeLeafLight} />
            <circle cx="75" cy="38" r="16" fill={env.treeLeafSun} opacity="0.9" />

            <circle cx="135" cy="55" r="36" fill={env.treeLeafDeep} />
            <circle cx="132" cy="50" r="30" fill={env.treeLeafMid} />
            <circle cx="128" cy="44" r="24" fill={env.treeLeafLight} />
            <circle cx="125" cy="38" r="16" fill={env.treeLeafSun} opacity="0.9" />

            {/* Gran domo superior central iluminado por el sol */}
            <circle cx="110" cy="38" r="38" fill={env.treeLeafDeep} />
            <circle cx="108" cy="32" r="32" fill={env.treeLeafMid} />
            <circle cx="104" cy="25" r="26" fill={env.treeLeafLight} />
            <circle cx="100" cy="18" r="18" fill={env.treeLeafSun} opacity="0.95" />
          </svg>
        </div>

      </div>

      {/* =========================================================================
          4. BANQUINA, CÉSPED VERDE Y GUARDARRAÍL DE SEGURIDAD
          ========================================================================= */}
      <div 
        className="absolute bottom-18 left-0 right-0 h-7 border-b border-black/40 overflow-hidden"
        style={{ backgroundColor: env.grassColor }}
      >
        <div className="w-full h-full flex items-center justify-around opacity-80">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={i} className="flex items-end gap-1">
              <div className="w-1 h-3.5 bg-emerald-300 rounded-t-full -mt-2 rotate-[-5deg]" />
              <div className="w-1 h-4 bg-emerald-400 rounded-t-full -mt-2.5 rotate-[5deg]" />
              {i % 4 === 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 -mt-3 shadow-[0_0_2px_#facc15]" />
              )}
              {i % 7 === 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 -mt-3 shadow-[0_0_2px_#fb7185]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guardarraíl de Acero Bionda con reflectores ámbar */}
      <div className="absolute bottom-18 left-0 right-0 h-4 bg-gradient-to-b from-[#94a3b8] via-[#e2e8f0] via-[#cbd5e1] to-[#475569] shadow-md border-t border-white/80 border-b border-slate-700 flex items-center justify-between px-4 z-10">
        <div className="w-full h-0.5 bg-slate-500/60 shadow-inner" />
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <div className="w-2 h-6 bg-slate-800 rounded-xs shadow-md -mt-1 border-r border-slate-600" />
              <div className="absolute top-0.5 w-1.5 h-1.5 bg-amber-400 rounded-xs shadow-[0_0_4px_#f59e0b] border border-amber-200" />
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          5. CARRETERA DE ASFALTO
          ========================================================================= */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-18 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] flex flex-col justify-between"
        style={{ backgroundColor: env.roadColor }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />
        <div className="w-full h-1.5 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.4)] border-b border-slate-300 relative z-10" />

        <div className="w-full h-1.5 flex items-center justify-between px-2 overflow-hidden relative z-10">
          <div 
            className="w-full h-1.5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${env.lineColor} 0px, ${env.lineColor} 45px, transparent 45px, transparent 100px)`,
              opacity: env.isNight ? 0.95 : 0.85,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2 h-1 bg-amber-300 rounded-xs shadow-[0_0_5px_#fde047] border border-amber-100" />
            ))}
          </div>
        </div>

        <div className="w-full h-2 bg-white/95 shadow-sm border-t border-slate-400 relative z-10" />
      </div>
    </div>
  );
});
