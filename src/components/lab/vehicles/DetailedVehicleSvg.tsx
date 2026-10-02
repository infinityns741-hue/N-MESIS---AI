import React from 'react';

export type VehicleId = 'land-cruiser' | 'pickup' | 'classic-red' | 'defender-green' | 'sport-yellow' | 'electric-cyan';

export interface VehicleConfig {
  id: VehicleId;
  name: string;
  tag: string;
  specs: string;
  primaryColor: string;
}

export const VEHICLE_LIST: VehicleConfig[] = [
  {
    id: 'land-cruiser',
    name: 'Toyota Land Cruiser 4x4',
    tag: 'Todoterreno Clásico Blanco',
    specs: 'Lunas polarizadas • Aros de aleación • Llanta repuesto trasera',
    primaryColor: '#f8fafc',
  },
  {
    id: 'pickup',
    name: 'Camioneta Pickup 4x4',
    tag: 'Pick-up Utilitaria Gris Plata',
    specs: 'Tolva de carga • Manijas cromadas • Aros off-road',
    primaryColor: '#94a3b8',
  },
  {
    id: 'classic-red',
    name: 'Campero Clásico Rojo 4x4',
    tag: 'Techo Rígido Blanco FJ40',
    specs: 'Faros redondos cromados • Estribos laterales • Repuesto posterior',
    primaryColor: '#ef4444',
  },
  {
    id: 'defender-green',
    name: 'Expedición 4x4 Verde Militar',
    tag: 'Chasis Largo Defender',
    specs: 'Múltiples ventanas • Rack de techo • Aros reforzados',
    primaryColor: '#15803d',
  },
  {
    id: 'sport-yellow',
    name: 'Coupé Deportivo GT Amarillo',
    tag: 'Aerodinámico de Carrera',
    specs: 'Perfil bajo • Alerón aerodinámico • Aros deportivos estrella',
    primaryColor: '#eab308',
  },
  {
    id: 'electric-cyan',
    name: 'Superauto Eléctrico Cyan',
    tag: 'Hiperdeportivo Futurista',
    specs: 'Líneas aerodinámicas • Faros láser Matrix • Aros tipo turbina',
    primaryColor: '#06b6d4',
  },
];

interface DetailedVehicleSvgProps {
  vehicleId: VehicleId;
  wheelRotationDeg: number;
  headlightsOn: boolean;
  isBraking: boolean;
}

export const DetailedVehicleSvg: React.FC<DetailedVehicleSvgProps> = ({
  vehicleId,
  wheelRotationDeg,
  headlightsOn,
  isBraking,
}) => {
  return (
    <div className="relative w-44 sm:w-56 h-24 select-none pointer-events-none">
      {/* Sombra de suelo oclusiva del vehículo */}
      <div className="absolute bottom-1 left-4 right-4 h-3 bg-black/70 rounded-full blur-[3px]" />

      {/* Haz de luz de los faros delanteros (se proyecta hacia la DERECHA iluminando la pista) */}
      {headlightsOn && (
        <div 
          className="absolute top-10 right-0 translate-x-[90%] w-64 sm:w-80 h-28 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse 100% 70% at 0% 40%, rgba(254, 240, 138, 0.45) 0%, rgba(254, 240, 138, 0.15) 50%, transparent 100%)',
            clipPath: 'polygon(0% 35%, 100% 0%, 100% 100%, 0% 70%)',
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* Luz roja trasera de frenado / posición */}
      {headlightsOn && (
        <div 
          className={`absolute top-9 left-1 w-5 h-5 rounded-full blur-[4px] pointer-events-none ${
            isBraking ? 'bg-red-500/90 shadow-[0_0_15px_#ef4444]' : 'bg-red-600/60'
          }`}
        />
      )}

      {/* =========================================================================
          VEHÍCULO 1: TOYOTA LAND CRUISER 4x4 BLANCO (Basado en Foto 1 del Usuario)
          ========================================================================= */}
      {vehicleId === 'land-cruiser' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          <defs>
            {/* Gradientes carrocería */}
            <linearGradient id="lcBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="lcWindowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#334155" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="lcChrome" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* 1. LLANTA DE REPUESTO TRASERA MONTADA EN EL PORTÓN (A LA IZQUIERDA) */}
          <g transform="translate(18, 50)">
            {/* Funda protectora negra de la llanta de repuesto */}
            <ellipse cx="0" cy="0" rx="14" ry="24" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <ellipse cx="-2" cy="0" rx="10" ry="18" fill="#1e293b" />
            <text x="-8" y="3" fill="#94a3b8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
              4x4
            </text>
          </g>

          {/* 2. PARAGOLPES TRASERO Y DELANTERO */}
          {/* Paragolpes trasero */}
          <rect x="18" y="70" width="12" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          {/* Paragolpes delantero */}
          <rect x="222" y="68" width="14" height="10" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          <rect x="228" y="71" width="6" height="4" rx="1" fill="#64748b" />

          {/* 3. CARROCERÍA PRINCIPAL (LAND CRUISER 70 BLANCO) */}
          <path
            d="
              M 30,73
              L 30,36
              Q 30,32 34,31
              L 128,31
              Q 133,31 138,34
              L 158,48
              L 218,50
              Q 224,51 226,56
              L 226,73
              L 204,73
              A 20,20 0 0,0 166,73
              L 92,73
              A 20,20 0 0,0 54,73
              Z
            "
            fill="url(#lcBodyGrad)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Paso de ruedas / Guardabarros delantero y trasero (Flares) */}
          <path d="M 50,73 A 24,24 0 0,1 96,73" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M 162,73 A 24,24 0 0,1 208,73" fill="none" stroke="#e2e8f0" strokeWidth="4" />

          {/* Faldones guardafangos (Mudflaps) */}
          <rect x="47" y="73" width="4" height="11" rx="1" fill="#1e293b" />
          <rect x="159" y="73" width="4" height="11" rx="1" fill="#1e293b" />

          {/* 4. LUNAS Y VENTANAS POLARIZADAS (DETALLADAS) */}
          {/* Ventana lateral trasera fija */}
          <path
            d="M 36,36 L 90,36 L 90,52 L 36,52 Z"
            fill="url(#lcWindowGrad)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Reflejo en luna trasera */}
          <line x1="42" y1="38" x2="52" y2="50" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6" />

          {/* Ventana de puerta del conductor con marco */}
          <path
            d="M 95,36 L 132,36 L 152,49 L 152,52 L 95,52 Z"
            fill="url(#lcWindowGrad)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Reflejo en parabrisas lateral */}
          <line x1="105" y1="38" x2="120" y2="50" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6" />
          <line x1="126" y1="38" x2="142" y2="50" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6" />

          {/* Silueta interior del volante y cabecera */}
          <circle cx="138" cy="46" r="3.5" fill="#0f172a" />
          <path d="M 136,50 L 142,47" stroke="#334155" strokeWidth="1.5" />
          <rect x="115" y="42" width="6" height="8" rx="2" fill="#0f172a" />

          {/* 5. LÍNEAS DE PANEL Y PUERTAS */}
          {/* Puerta del conductor */}
          <path d="M 93,34 L 93,73" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 155,50 L 155,73" stroke="#94a3b8" strokeWidth="1" />

          {/* MANIJA CROMADA DE LA PUERTA (Con hueco y tirador) */}
          <rect x="100" y="55" width="10" height="4" rx="1.5" fill="#475569" />
          <rect x="101" y="56" width="8" height="2" rx="1" fill="url(#lcChrome)" stroke="#64748b" strokeWidth="0.5" />

          {/* Manija de puerta trasera */}
          <rect x="33" y="55" width="4" height="2.5" rx="0.8" fill="url(#lcChrome)" />

          {/* ESPEJO RETROVISOR LATERAL CROMADO */}
          <rect x="150" y="48" width="5" height="9" rx="1.5" fill="url(#lcChrome)" stroke="#475569" strokeWidth="0.8" />
          <line x1="147" y1="52" x2="150" y2="52" stroke="#334155" strokeWidth="2" />

          {/* 6. FRANJA DECORATIVA LATERAL 4x4 (Estilo Land Cruiser Foto 1) */}
          <g opacity="0.85">
            <polygon points="96,60 148,60 145,64 96,64" fill="#d97706" />
            <polygon points="102,64 152,64 149,67 102,67" fill="#475569" />
            <text x="160" y="65" fill="#475569" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif">
              LAND CRUISER
            </text>
          </g>

          {/* 7. ESTRIBO LATERAL CROMADO (SIDE STEP) */}
          <rect x="94" y="74" width="62" height="3" rx="1" fill="url(#lcChrome)" stroke="#475569" strokeWidth="0.5" />
          <line x1="102" y1="77" x2="102" y2="80" stroke="#334155" strokeWidth="2" />
          <line x1="148" y1="77" x2="148" y2="80" stroke="#334155" strokeWidth="2" />

          {/* 8. LUCES DELANTERAS Y TRASERAS */}
          {/* Faro delantero derecho principal con proyector de cristal */}
          <rect x="220" y="55" width="6" height="9" rx="2" fill={headlightsOn ? '#fef08a' : '#e2e8f0'} stroke="#475569" strokeWidth="1" />
          {/* Luz de giro ámbar envolvente */}
          <rect x="216" y="56" width="3" height="7" rx="1" fill="#f59e0b" />
          {/* Luz trasera roja (Tail Light) */}
          <rect x="28" y="56" width="3" height="10" rx="1" fill={isBraking || headlightsOn ? '#ef4444' : '#991b1b'} stroke="#1e293b" strokeWidth="0.5" />

          {/* =====================================================================
              9. RUEDAS OFF-ROAD REALISTAS CON AROS DE ALEACIÓN QUE GIRAN
              ===================================================================== */}
          {/* RUEDA TRASERA (Centro x=73, y=73) */}
          <g transform="translate(73, 73)">
            {/* Neumático negro con relieve todo-terreno */}
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />

            {/* ARO DE ALEACIÓN DE 5 RADIOS QUE GIRA FÍSICAMENTE CON wheelRotationDeg */}
            <g transform={`rotate(${wheelRotationDeg})`}>
              {/* Aro exterior plateado */}
              <circle cx="0" cy="0" r="10.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Radios dobles de aleación de aluminio */}
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-9.5" y1="-3" x2="9.5" y2="3" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-5.8" y1="8" x2="5.8" y2="-8" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-5.8" y1="-8" x2="5.8" y2="8" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              {/* Tapa central con pernos cromados */}
              <circle cx="0" cy="0" r="4" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#cbd5e1" />
            </g>
          </g>

          {/* RUEDA DELANTERA (Centro x=185, y=73) */}
          <g transform="translate(185, 73)">
            {/* Neumático todo terreno */}
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />

            {/* ARO DE ALEACIÓN QUE GIRA */}
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-9.5" y1="-3" x2="9.5" y2="3" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-5.8" y1="8" x2="5.8" y2="-8" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-5.8" y1="-8" x2="5.8" y2="8" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="4" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="#cbd5e1" />
            </g>
          </g>
        </svg>
      )}

      {/* =========================================================================
          VEHÍCULO 2: CAMIONETA PICKUP 4x4 GRIS PLATA (Basada en Foto 2)
          ========================================================================= */}
      {vehicleId === 'pickup' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="pickupGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Parachoques trasero y tolva */}
          <rect x="22" y="70" width="10" height="7" rx="1.5" fill="#334155" />
          <rect x="224" y="68" width="12" height="9" rx="2" fill="#334155" />

          {/* Carrocería con tolva y cabina */}
          <path
            d="
              M 30,73
              L 30,52
              L 115,52
              L 115,36
              Q 117,32 122,32
              L 155,32
              Q 160,32 165,37
              L 182,52
              L 225,52
              Q 228,54 228,58
              L 228,73
              L 204,73
              A 20,20 0 0,0 166,73
              L 92,73
              A 20,20 0 0,0 54,73
              Z
            "
            fill="url(#pickupGrad)"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Borde superior de la tolva (Bed Rail) */}
          <line x1="30" y1="52" x2="115" y2="52" stroke="#1e293b" strokeWidth="2.5" />

          {/* Guardabarros estilo cuadrado offroad */}
          <path d="M 52,73 L 57,63 L 89,63 L 94,73" fill="none" stroke="#475569" strokeWidth="3" />
          <path d="M 164,73 L 169,63 L 201,63 L 206,73" fill="none" stroke="#475569" strokeWidth="3" />

          {/* Ventana de cabina con pilar B */}
          <path
            d="M 120,36 L 152,36 L 176,50 L 120,50 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          <line x1="130" y1="38" x2="145" y2="48" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6" />

          {/* Manija cromada de puerta de cabina */}
          <rect x="135" y="56" width="10" height="3" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
          <path d="M 115,36 L 115,73" stroke="#475569" strokeWidth="1" />
          <path d="M 180,52 L 180,73" stroke="#475569" strokeWidth="1" />

          {/* Retrovisor */}
          <rect x="174" y="47" width="5" height="9" rx="1.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
          <line x1="170" y1="51" x2="174" y2="51" stroke="#334155" strokeWidth="2" />

          {/* Faros delanteros y traseros */}
          <rect x="222" y="56" width="6" height="8" rx="1.5" fill={headlightsOn ? '#fef08a' : '#e2e8f0'} stroke="#334155" strokeWidth="1" />
          <rect x="218" y="57" width="3" height="6" rx="1" fill="#f59e0b" />
          <rect x="29" y="54" width="3" height="9" rx="1" fill={isBraking || headlightsOn ? '#ef4444' : '#991b1b'} />

          {/* RUEDA TRASERA */}
          <g transform="translate(73, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#f1f5f9" strokeWidth="2" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#f1f5f9" strokeWidth="2" />
              <line x1="-7" y1="-7" x2="7" y2="7" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="-7" y1="7" x2="7" y2="-7" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          </g>

          {/* RUEDA DELANTERA */}
          <g transform="translate(185, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#f1f5f9" strokeWidth="2" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#f1f5f9" strokeWidth="2" />
              <line x1="-7" y1="-7" x2="7" y2="7" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="-7" y1="7" x2="7" y2="-7" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          </g>
        </svg>
      )}

      {/* =========================================================================
          VEHÍCULO 3: CAMPERO CLÁSICO ROJO 4x4 (FJ40 con techo rígido blanco)
          ========================================================================= */}
      {vehicleId === 'classic-red' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          {/* Llanta de repuesto trasera */}
          <g transform="translate(16, 52)">
            <ellipse cx="0" cy="0" rx="12" ry="22" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <circle cx="-1" cy="0" r="7" fill="#334155" />
          </g>

          {/* Carrocería Roja con Techo Rígido Blanco */}
          {/* Techo rígido blanco */}
          <path
            d="M 30,50 L 30,34 Q 32,30 38,30 L 135,30 Q 140,30 144,34 L 156,50 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Carrocería roja inferior */}
          <path
            d="
              M 30,73
              L 30,50
              L 156,50
              L 165,50
              L 215,52
              Q 220,53 222,58
              L 222,73
              L 204,73
              A 20,20 0 0,0 166,73
              L 92,73
              A 20,20 0 0,0 54,73
              Z
            "
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="1.2"
          />

          {/* Ventanas */}
          <path d="M 36,34 L 75,34 L 75,48 L 36,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 80,34 L 110,34 L 110,48 L 80,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 115,34 L 138,34 L 152,48 L 115,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />

          {/* Manija clásica de puerta */}
          <rect x="90" y="54" width="9" height="3" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
          <path d="M 80,34 L 80,73" stroke="#991b1b" strokeWidth="1" />

          {/* Retrovisor redondo clásico */}
          <circle cx="152" cy="46" r="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
          <line x1="147" y1="50" x2="151" y2="47" stroke="#334155" strokeWidth="1.5" />

          {/* Faros redondos frontales clásicos */}
          <circle cx="218" cy="58" r="4.5" fill={headlightsOn ? '#fef08a' : '#f8fafc'} stroke="#475569" strokeWidth="1.2" />
          <circle cx="213" cy="65" r="2" fill="#f59e0b" />
          <rect x="28" y="56" width="3" height="8" rx="1" fill={isBraking || headlightsOn ? '#ef4444' : '#991b1b'} />

          {/* Parachoques delantero cromado */}
          <rect x="220" y="68" width="12" height="8" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

          {/* RUEDA TRASERA */}
          <g transform="translate(73, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="6" fill="#cbd5e1" />
              {/* Agujeros de llanta clásica de acero */}
              <circle cx="0" cy="-6.5" r="1.5" fill="#1e293b" />
              <circle cx="6.5" cy="0" r="1.5" fill="#1e293b" />
              <circle cx="0" cy="6.5" r="1.5" fill="#1e293b" />
              <circle cx="-6.5" cy="0" r="1.5" fill="#1e293b" />
              <circle cx="0" cy="0" r="2.5" fill="#475569" />
            </g>
          </g>

          {/* RUEDA DELANTERA */}
          <g transform="translate(185, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="6" fill="#cbd5e1" />
              <circle cx="0" cy="-6.5" r="1.5" fill="#1e293b" />
              <circle cx="6.5" cy="0" r="1.5" fill="#1e293b" />
              <circle cx="0" cy="6.5" r="1.5" fill="#1e293b" />
              <circle cx="-6.5" cy="0" r="1.5" fill="#1e293b" />
              <circle cx="0" cy="0" r="2.5" fill="#475569" />
            </g>
          </g>
        </svg>
      )}

      {/* =========================================================================
          VEHÍCULO 4: EXPEDICIÓN 4x4 VERDE MILITAR (Defender con Rack de Techo)
          ========================================================================= */}
      {vehicleId === 'defender-green' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          {/* Rack de techo con equipaje */}
          <line x1="36" y1="28" x2="160" y2="28" stroke="#1e293b" strokeWidth="2.5" />
          <rect x="50" y="22" width="25" height="6" rx="1.5" fill="#334155" />
          <rect x="80" y="24" width="35" height="4" rx="1" fill="#475569" />

          {/* Carrocería Chasis Largo */}
          <path
            d="
              M 30,73
              L 30,34
              Q 32,32 36,32
              L 165,32
              L 180,48
              L 222,50
              Q 225,52 226,56
              L 226,73
              L 204,73
              A 20,20 0 0,0 166,73
              L 92,73
              A 20,20 0 0,0 54,73
              Z
            "
            fill="#15803d"
            stroke="#166534"
            strokeWidth="1.2"
          />

          {/* Ventanillas alargadas estilo Safari */}
          <path d="M 36,36 L 70,36 L 70,48 L 36,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <path d="M 75,36 L 115,36 L 115,48 L 75,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <path d="M 120,36 L 155,36 L 172,48 L 120,48 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

          {/* Manijas en ambas puertas */}
          <rect x="85" y="54" width="8" height="2.5" rx="1" fill="#f8fafc" stroke="#1e293b" strokeWidth="0.8" />
          <rect x="135" y="54" width="8" height="2.5" rx="1" fill="#f8fafc" stroke="#1e293b" strokeWidth="0.8" />

          {/* Snorkel en pilar A */}
          <path d="M 175,48 L 175,28 L 178,28 L 178,48" stroke="#1e293b" strokeWidth="2.5" fill="none" />

          {/* Faros delanteros */}
          <circle cx="221" cy="58" r="4.5" fill={headlightsOn ? '#fef08a' : '#f8fafc'} stroke="#1e293b" strokeWidth="1" />
          <circle cx="215" cy="65" r="2" fill="#f59e0b" />
          <rect x="28" y="56" width="3" height="8" rx="1" fill={isBraking || headlightsOn ? '#ef4444' : '#991b1b'} />

          {/* RUEDA TRASERA */}
          <g transform="translate(73, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="6" fill="#1e293b" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="2" fill="#cbd5e1" />
            </g>
          </g>

          {/* RUEDA DELANTERA */}
          <g transform="translate(185, 73)">
            <circle cx="0" cy="0" r="16.5" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="6" fill="#1e293b" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#94a3b8" strokeWidth="2" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="2" fill="#cbd5e1" />
            </g>
          </g>
        </svg>
      )}

      {/* =========================================================================
          VEHÍCULO 5: COUPÉ DEPORTIVO GT AMARILLO
          ========================================================================= */}
      {vehicleId === 'sport-yellow' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sportYellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Alerón trasero GT */}
          <path d="M 22,46 L 24,54 L 28,54 L 26,46 Z" fill="#1e293b" />
          <path d="M 18,45 L 34,44 L 33,48 L 17,49 Z" fill="#0f172a" />
          {/* Carrocería deportiva aerodinámica */}
          <path
            d="
              M 26,62
              C 28,54 36,52 50,52
              C 70,52 90,38 120,38
              C 145,38 175,44 195,58
              L 224,62
              C 228,64 228,72 222,74
              L 202,74
              A 19,19 0 0,0 164,74
              L 90,74
              A 19,19 0 0,0 52,74
              L 24,74
              C 20,74 20,64 26,62 Z
            "
            fill="url(#sportYellowGrad)"
            stroke="#a16207"
            strokeWidth="1.2"
          />
          {/* Ventanilla tintada coupé */}
          <path
            d="M 68,52 C 84,42 110,40 125,40 C 145,40 165,45 178,52 Z"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1"
          />
          {/* Faro delantero rasgado */}
          <path d="M 215,62 L 225,63 L 220,67 Z" fill={headlightsOn ? '#ffffff' : '#fef08a'} />
          {/* Piloto trasero led */}
          <rect x="22" y="60" width="4" height="6" rx="1" fill={isBraking || headlightsOn ? '#ef4444' : '#991b1b'} />
          {/* Rueda trasera */}
          <g transform="translate(71, 74)">
            <circle cx="0" cy="0" r="16" fill="#090d16" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="12" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10" fill="#020617" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#cbd5e1" strokeWidth="1.8" />
              <line x1="-9" y1="0" x2="9" y2="0" stroke="#cbd5e1" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="2.5" fill="#eab308" />
            </g>
          </g>
          {/* Rueda delantera */}
          <g transform="translate(183, 74)">
            <circle cx="0" cy="0" r="16" fill="#090d16" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="12" fill="#1e293b" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10" fill="#020617" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#cbd5e1" strokeWidth="1.8" />
              <line x1="-9" y1="0" x2="9" y2="0" stroke="#cbd5e1" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="2.5" fill="#eab308" />
            </g>
          </g>
        </svg>
      )}

      {/* =========================================================================
          VEHÍCULO 6: SUPERAUTO ELÉCTRICO CYAN
          ========================================================================= */}
      {vehicleId === 'electric-cyan' && (
        <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="elecGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          {/* Carrocería futurista hiperbólica */}
          <path
            d="
              M 24,65
              C 26,56 40,50 65,48
              C 95,44 125,36 150,38
              C 175,40 205,52 226,62
              C 230,64 228,72 222,74
              L 204,74
              A 19,19 0 0,0 166,74
              L 92,74
              A 19,19 0 0,0 54,74
              L 22,74
              C 18,74 18,66 24,65 Z
            "
            fill="url(#elecGrad)"
            stroke="#0891b2"
            strokeWidth="1.2"
          />
          {/* Cabina cúpula de vidrio futurista continuo */}
          <path
            d="M 75,47 C 105,37 135,37 165,46 C 150,42 110,42 80,48 Z"
            fill="#020617"
            stroke="#22d3ee"
            strokeWidth="1"
          />
          {/* Tira de led de luces delanteras cian */}
          <line x1="210" y1="62" x2="226" y2="64" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="64" x2="30" y2="64" stroke={isBraking ? '#ef4444' : '#0891b2'} strokeWidth="2" />
          {/* Rueda trasera turbina */}
          <g transform="translate(73, 74)">
            <circle cx="0" cy="0" r="16" fill="#090d16" stroke="#0891b2" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#0f172a" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#67e8f9" strokeWidth="2" />
              <line x1="-8" y1="-5" x2="8" y2="5" stroke="#67e8f9" strokeWidth="2" />
              <line x1="-8" y1="5" x2="8" y2="-5" stroke="#67e8f9" strokeWidth="2" />
              <circle cx="0" cy="0" r="3" fill="#06b6d4" />
            </g>
          </g>
          {/* Rueda delantera turbina */}
          <g transform="translate(185, 74)">
            <circle cx="0" cy="0" r="16" fill="#090d16" stroke="#0891b2" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#0f172a" />
            <g transform={`rotate(${wheelRotationDeg})`}>
              <circle cx="0" cy="0" r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
              <line x1="0" y1="-9" x2="0" y2="9" stroke="#67e8f9" strokeWidth="2" />
              <line x1="-8" y1="-5" x2="8" y2="5" stroke="#67e8f9" strokeWidth="2" />
              <line x1="-8" y1="5" x2="8" y2="-5" stroke="#67e8f9" strokeWidth="2" />
              <circle cx="0" cy="0" r="3" fill="#06b6d4" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
};
