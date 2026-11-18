import bcrypt from 'bcryptjs';

export interface SeedMission {
  slug: string;
  title: string;
  category: 'phishing' | 'privacy' | 'digital_law';
  difficulty: 'inicial' | 'intermedio' | 'avanzado';
  xpReward: number;
  basePoints: number;
  brief: string;
  artifactType: 'email' | 'privacy_notice' | 'incident_log' | 'legal_dossier';
  artifactData: {
    sender?: string;
    recipient?: string;
    subject?: string;
    headers?: string[];
    body: string;
    suspiciousIndicators?: string[];
    metadata?: Record<string, string>;
  };
  question: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
  referenceSolution: string;
  legalContext: string;
  isActive: boolean;
  createdBy: string;
}

export interface SeedAchievement {
  code: string;
  title: string;
  description: string;
  category: 'general' | 'phishing' | 'privacy' | 'digital_law' | 'mastery';
  xpBonus: number;
  iconKey: string;
}

export const SEED_ACHIEVEMENTS: SeedAchievement[] = [
  {
    code: 'FIRST_CASE',
    title: 'Primer Expediente Resuelto',
    description: 'Completa correctamente tu primera misión operativa en CiberDetective AI.',
    category: 'general',
    xpBonus: 50,
    iconKey: 'shield-check',
  },
  {
    code: 'PHISHING_HUNTER',
    title: 'Cazador de Phishing',
    description: 'Resuelve correctamente al menos 2 casos de phishing y fraude digital.',
    category: 'phishing',
    xpBonus: 100,
    iconKey: 'mail-warning',
  },
  {
    code: 'PRIVACY_GUARDIAN',
    title: 'Guardián de la Privacidad',
    description: 'Resuelve correctamente al menos 2 misiones de protección de datos y privacidad.',
    category: 'privacy',
    xpBonus: 100,
    iconKey: 'lock',
  },
  {
    code: 'DIGITAL_JURIST',
    title: 'Jurista Digital',
    description: 'Resuelve correctamente al menos 2 casos de derecho digital español y europeo.',
    category: 'digital_law',
    xpBonus: 120,
    iconKey: 'scale',
  },
  {
    code: 'STREAK_3',
    title: 'Racha Impecable',
    description: 'Encadena 3 respuestas correctas consecutivas sin errores.',
    category: 'mastery',
    xpBonus: 125,
    iconKey: 'flame',
  },
  {
    code: 'ANALYST_ARGUMENTS',
    title: 'Perito Forense',
    description: 'Envía una justificación analítica detallada junto con una respuesta correcta.',
    category: 'mastery',
    xpBonus: 75,
    iconKey: 'file-search',
  },
  {
    code: 'SOC_SENIOR',
    title: 'Especialista SOC',
    description: 'Alcanza el Nivel 3 de experiencia dentro de la plataforma.',
    category: 'general',
    xpBonus: 150,
    iconKey: 'award',
  },
  {
    code: 'FULL_SPECTRUM',
    title: 'Cobertura Integral',
    description: 'Resuelve al menos un caso correcto en cada una de las 3 ramas principales.',
    category: 'mastery',
    xpBonus: 200,
    iconKey: 'compass',
  },
];

export const SEED_MISSIONS: SeedMission[] = [
  {
    slug: 'bec-transferencia-urgente',
    title: 'Caso 01: Orden de transferencia urgente desde Dirección',
    category: 'phishing',
    difficulty: 'inicial',
    xpReward: 120,
    basePoints: 150,
    brief:
      'El departamento de administración de IberLogística S.A. (dominio legítimo: iberlogistica.es) recibe un correo el viernes a las 18:45 solicitando una transferencia inmediata por una supuesta adquisición confidencial.',
    artifactType: 'email',
    artifactData: {
      sender: 'Carlos Mendoza <c.mendoza@iberlogistlca-es.com>',
      recipient: 'tesoreria@iberlogistica.es',
      subject: 'URGENTE Y CONFIDENCIAL: Pago proveedor auditoría hoy antes de las 19:30',
      headers: [
        'Return-Path: <bounce@mailer-secure-panel.xyz>',
        'Authentication-Results: spf=fail (sender IP 185.220.101.44); dkim=none; dmarc=fail',
        'Reply-To: pagos.confidenciales@outlook-corp-verify.com',
      ],
      body:
        'Hola equipo de Tesorería,\n\nEstoy en reunión fuera de oficina cerrando una operación confidencial y no puedo atender llamadas. Necesito que ejecutéis de inmediato una transferencia de 28.400 EUR a la nueva cuenta adjunta para evitar penalizaciones.\n\nConfirmadme el justificante por este mismo correo antes de las 19:30.\n\nUn saludo,\nCarlos Mendoza — Director Financiero',
      suspiciousIndicators: [
        'Dominio visualmente similar (typosquatting: iberlogistlca-es.com con una "l" en lugar de "i").',
        'SPF=fail y DMARC=fail en cabeceras técnicas.',
        'Urgencia extrema y prohibición implícita de verificación telefónica.',
      ],
    },
    question:
      '¿Cuál es la clasificación técnica correcta del incidente y la primera medida operativa recomendada?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Es un ataque de Business Email Compromise (BEC / Fraude del CEO) mediante typosquatting y fallo de autenticación; debe bloquearse la operación y verificar la orden por un canal alternativo preestablecido (llamada directa o intranet).',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Es un fallo temporal de configuración DNS del proveedor legítimo; conviene responder al campo Reply-To solicitando el código interno de proyecto antes de transferir.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Es un ataque de ransomware cifrado; debe apagarse inmediatamente toda la red bancaria europea y reenviar el correo a toda la plantilla.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Al aparecer el nombre real del Director Financiero en la firma, se puede ejecutar un pago parcial de prueba para validar la cuenta bancaria.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'Se trata de un ataque clásico de Business Email Compromise (BEC) o fraude del CEO. Combina ingeniería social basada en autoridad y urgencia con typosquatting de dominio (iberlogistlca-es.com) y desvío en el Reply-To. Las cabeceras muestran SPF=fail, DKIM=none y DMARC=fail. La respuesta operativa correcta es no ejecutar ningún pago, verificar siempre fuera de banda (out-of-band) por teléfono corporativo conocido, y reportar el incidente al equipo de ciberseguridad para bloquear el dominio fraudulento y reforzar políticas DMARC.',
    legalContext:
      'En el ámbito español y europeo, el fraude BEC puede constituir un delito de estafa informática y suplantación/falsedad según el Código Penal español, además de exigir controles internos de diligencia y prevención de fraude corporativo. Si se produce exfiltración o compromiso de datos personales vinculados a empleados o clientes, debe evaluarse la obligación de gestión de incidentes bajo el RGPD y la LOPDGDD.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'smishing-banca-otp',
    title: 'Caso 02: Alerta SMS de bloqueo de cuenta bancaria',
    category: 'phishing',
    difficulty: 'intermedio',
    xpReward: 160,
    basePoints: 200,
    brief:
      'Una usuaria recibe un SMS en el mismo hilo de mensajes donde habitualmente recibe alertas reales de su entidad bancaria, advirtiendo de un acceso no autorizado desde el extranjero.',
    artifactType: 'incident_log',
    artifactData: {
      sender: 'MiBancoES (Sender ID suplantado)',
      recipient: '+34 600 *** 412',
      subject: 'SMS de alerta de seguridad y enlace de reactivación',
      headers: [
        'URL destino: https://mibanco-es.verificacion-segura-acceso.com/login',
        'Certificado TLS: Let’s Encrypt emitido hace 2 horas',
        'Formulario solicita: DNI, clave de acceso y código OTP recibido por SMS',
      ],
      body:
        'AVISO SEGURIDAD: Detectado acceso sospechoso en su cuenta desde Lisboa. Su tarjeta será suspendida en 2 horas si no verifica su identidad en: https://mibanco-es.verificacion-segura-acceso.com/login',
      suspiciousIndicators: [
        'Suplantación del Sender ID alfanumérico para colarse en el hilo legítimo del banco.',
        'Dominio externo no perteneciente al banco (verificacion-segura-acceso.com).',
        'Solicitud simultánea de credenciales y código OTP de un solo uso.',
      ],
    },
    question:
      '¿Por qué el candado HTTPS del navegador en ese enlace NO garantiza legitimidad y cómo debe analizarse este ataque?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'El candado HTTPS solo cifra el tráfico entre el usuario y el servidor atacante; el dominio real es ajeno al banco y la petición de OTP busca eludir la autenticación reforzada (SCA) de PSD2 mediante smishing.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Si aparece en el hilo de SMS previos del banco, el operador móvil ha verificado criptográficamente el mensaje y el problema reside únicamente en la fecha del certificado TLS.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'El candado TLS garantiza la identidad de la entidad bancaria española, por lo que basta con introducir el DNI sin compartir la contraseña.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Es una vulnerabilidad de almacenamiento en caché del navegador móvil que se resuelve borrando las cookies sin cambiar credenciales.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'El ataque es smishing (phishing por SMS) con spoofing del Sender ID alfanumérico. Un certificado TLS/HTTPS válido únicamente indica que la conexión está cifrada hacia ese servidor, no que el dominio pertenezca al banco legítimo (aquí el dominio registrable es verificacion-segura-acceso.com). Al solicitar credenciales y el código OTP en tiempo real, el atacante intenta superar la autenticación reforzada de clientes (SCA) para autorizar operaciones fraudulentas.',
    legalContext:
      'En el marco europeo de servicios de pago (Directiva PSD2 y normativa española de servicios de pago), las entidades deben aplicar Autenticación Reforzada de Clientes (SCA) y analizar operaciones no autorizadas. Desde la perspectiva penal en España, la captación fraudulenta de credenciales y desvío de fondos encaja en la estafa informática, siendo relevante conservar evidencias (capturas, URL, hora del SMS) para la denuncia ante las Fuerzas y Cuerpos de Seguridad y la reclamación a la entidad.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'spear-phishing-rrhh-macro',
    title: 'Caso 03: Currículum adjunto con macros en Recursos Humanos',
    category: 'phishing',
    difficulty: 'avanzado',
    xpReward: 220,
    basePoints: 260,
    brief:
      'Una técnica de selección recibe un correo dirigido por su nombre mencionando una vacante real publicada hace 48 horas, con un archivo adjunto para evaluar a un supuesto candidato.',
    artifactType: 'email',
    artifactData: {
      sender: 'Jorge Salgado <jorge.salgado.dev@proton.me>',
      recipient: 'seleccion@tecnonorte-servicios.es',
      subject: 'Candidatura Senior Cloud Architect — Referencia Oferta #TN-402',
      headers: [
        'Adjunto: CV_Jorge_Salgado_2026.docm (Word habilitado para macros)',
        'Contenido visual del documento: "Para visualizar el portafolio cifrado pulse Habilitar contenido"',
      ],
      body:
        'Estimada Elena,\n\nVi vuestra publicación para Senior Cloud Architect (#TN-402) en LinkedIn. Adjunto mi currículum detallado y referencias técnicas en el documento Word para vuestra valoración.\n\nQuedo atento a vuestra entrevista.',
      suspiciousIndicators: [
        'Uso de formato .docm (documento con macros) en lugar de PDF estándar.',
        'Pretexto contextualizado (Spear-Phishing) usando nombre de la reclutadora y código real de oferta.',
        'Mensaje engañoso dentro del documento invitando a "Habilitar contenido".',
      ],
    },
    question:
      '¿Qué vector de infección representa el adjunto y cuál es la medida técnica preventiva más eficaz en el puesto de trabajo?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Ejecución de código mediante macros VBA maliciosas (spear-phishing); la medida clave es bloquear por política las macros en documentos procedentes de Internet, usar sandboxing de correo y exigir formatos seguros como PDF.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Ataque de inyección SQL directa al servidor de correo; se mitiga cambiando el formato a .xlsm antes de abrirlo en local.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Pérdida accidental de metadatos EXIF; se soluciona abriendo el archivo en modo administrador para validar la firma del autor.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Ataque de denegación de servicio distribuido (DDoS) contra el portal de empleo; basta con desactivar el firewall corporativo temporalmente.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'Es un caso de Spear-Phishing dirigido con un archivo Office habilitado para macros (.docm). Al pulsar "Habilitar contenido", el código VBA puede descargar payloads (troyanos bancarios, infostealers o ransomware) mediante PowerShell o LOLBins. La defensa en profundidad exige bloquear macros de documentos provenientes de Internet (Mark-of-the-Web), filtrar extensiones ejecutables o con macros en la pasarela de correo, activar EDR y concienciar a RR.HH. para aceptar únicamente PDFs verificados o portales de candidatura seguros.',
    legalContext:
      'La infección de sistemas corporativos mediante malware puede comprometer datos personales de candidatos y empleados, activando las obligaciones de seguridad técnica y organizativa exigidas por el RGPD y la LOPDGDD (principio de integridad y confidencialidad), además de constituir posibles delitos de daños informáticos y acceso ilícito según el Código Penal español por parte del atacante.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'brecha-datos-plazo-aepd',
    title: 'Caso 04: Exposición de base de datos de clientes y plazo de notificación',
    category: 'privacy',
    difficulty: 'inicial',
    xpReward: 130,
    basePoints: 160,
    brief:
      'A las 09:00 del martes, el equipo de sistemas confirma que un repositorio de copias de seguridad en la nube permaneció accesible públicamente durante 36 horas con nombres, correos, DNI y números IBAN de 14.000 clientes españoles.',
    artifactType: 'incident_log',
    artifactData: {
      subject: 'Informe preliminar de brecha de seguridad #INC-2026-118',
      body:
        'Resumen técnico:\n- Datos expuestos: Nombre completo, correo electrónico, DNI/NIE y cuenta IBAN.\n- Volumen estimado: 14.000 titulares residentes en España.\n- Evidencia de acceso: Se registran 19 descargas completas desde direcciones IP externas desconocidas antes de cerrar el acceso.\n- La dirección propone esperar 15 días hasta completar toda la auditoría forense antes de informar a la autoridad.',
      metadata: {
        'Autoridad competente': 'Agencia Española de Protección de Datos (AEPD)',
        'Riesgo identificado': 'Alto (riesgo de suplantación y fraude financiero por DNI + IBAN)',
      },
    },
    question:
      'Según el Reglamento General de Protección de Datos (RGPD), ¿qué decisión legal y operativa es la correcta respecto a la notificación?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Notificar la brecha a la AEPD sin dilación indebida y a más tardar en 72 horas desde que se tuvo constancia (aunque la investigación siga en curso, ampliando detalles por fases), y comunicarla también a los afectados por existir un alto riesgo para sus derechos.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Esperar 15 días a cerrar el informe forense definitivo antes de contactar con la AEPD y evitar informar a los clientes para no generar alarma reputacional.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'No es necesario notificar porque los datos fueron descargados desde IPs externas y no cifrados por ransomware.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Publicar únicamente una nota genérica en redes sociales a final de mes sustituye la notificación individual y ante la autoridad.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'Conforme al RGPD, cuando una violación de la seguridad de los datos personales entrañe un riesgo para los derechos y libertades, el responsable debe notificarla a la autoridad de control competente (en España, la AEPD) sin dilación indebida y, de ser posible, a más tardar 72 horas después de haber tenido constancia de ella. Si no se dispone de toda la información forense, puede facilitarse de forma escalonada. Además, al combinarse DNI e IBAN con evidencias de exfiltración externa, existe un alto riesgo de fraude y suplantación, por lo que también debe comunicarse sin dilación indebida a los propios interesados.',
    legalContext:
      'Marco aplicable: Reglamento General de Protección de Datos (RGPD) de la Unión Europea y Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) en España. Regulan la obligación del responsable del tratamiento de notificar brechas de seguridad en un plazo máximo de 72 horas ante la AEPD (salvo que sea improbable que constituya un riesgo) y de comunicarla a los afectados cuando entrañe un alto riesgo para sus derechos y libertades.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'cookies-patron-oscuro',
    title: 'Caso 05: Banner de cookies con diseño asimétrico ("Dark Pattern")',
    category: 'privacy',
    difficulty: 'intermedio',
    xpReward: 165,
    basePoints: 200,
    brief:
      'Una tienda online española lanza un nuevo banner de cookies. El botón "Aceptar todas" aparece en verde brillante en la primera capa, mientras que para rechazarlas el usuario debe pulsar "Configurar", abrir un modal y desmarcar manualmente 12 interruptores.',
    artifactType: 'privacy_notice',
    artifactData: {
      subject: 'Auditoría UX de Consentimiento — Comercio Electrónico',
      body:
        'Configuración actual observada:\n1. Primera capa: Botón destacado "Aceptar todo" y enlace gris pequeño "Ajustes". No hay botón "Rechazar todo".\n2. Cookies de publicidad comportamental activas por defecto al navegar ("seguir navegando implica aceptar").\n3. El equipo de marketing defiende que la política de privacidad explica cómo desactivar cookies en el navegador.',
      metadata: {
        'Guía de referencia': 'Criterios sobre el uso de las cookies de la AEPD',
        'Normativa': 'LSSI-CE y RGPD',
      },
    },
    question:
      '¿Qué incumplimientos normativos presenta este banner según la legislación española y europea sobre cookies?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'El consentimiento no es válido: no puede deducirse de "seguir navegando", las cookies no necesarias no pueden preactivarse y la opción de rechazar debe ser tan visible y sencilla como la de aceptar en la misma capa.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Es plenamente legal mientras exista un enlace en el pie de página explicando cómo borrar las cookies desde Chrome o Firefox.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Solo incumple la normativa si la tienda factura más de 50 millones de euros anuales; en pymes basta con el aviso informativo.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Únicamente requiere corregir el color del botón, manteniendo premarcadas las cookies analíticas y publicitarias.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'El diseño incumple tanto los requisitos de consentimiento del RGPD como la LSSI-CE y la Guía sobre el uso de las cookies de la AEPD. El consentimiento debe prestarse mediante una clara acción afirmativa (no es válido "seguir navegando" ni casillas premarcadas), y rechazar las cookies no esenciales debe ser igual de fácil, directo y visible que aceptarlas (en la primera capa, sin patrones oscuros que dificulten la negativa).',
    legalContext:
      'En España, el uso de cookies no estrictamente necesarias se rige por la Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE) en coordinación con los estándares de consentimiento libre, específico, informado e inequívoco del RGPD y las directrices publicadas por la Agencia Española de Protección de Datos (AEPD), que prohíben las casillas premarcadas, el consentimiento implícito por navegación y los diseños engañosos que dificultan el rechazo.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'videovigilancia-zona-descanso',
    title: 'Caso 06: Videovigilancia con audio en la sala de descanso laboral',
    category: 'privacy',
    difficulty: 'avanzado',
    xpReward: 210,
    basePoints: 250,
    brief:
      'Tras la desaparición de material de oficina, la gerencia de una empresa instala cámaras ocultas con grabación continua de vídeo y audio dentro del comedor y vestuarios del personal, sin informar a la plantilla.',
    artifactType: 'legal_dossier',
    artifactData: {
      subject: 'Expediente de Inspección Interna — Control Laboral',
      body:
        'Hechos constatados:\n- Dispositivos instalados: Cámaras domo ocultas con micrófono activo en la zona de comedor/descanso y acceso a vestuarios.\n- Cartelería: No existe cartel informativo de zona videovigilada ni comunicación previa a los trabajadores ni a su representación.\n- Justificación alegada: Poder de dirección empresarial ante sospechas de hurtos menores.',
      metadata: {
        'Ámbito': 'Derechos digitales en el ámbito laboral (España)',
        'Principios en juego': 'Proporcionalidad, minimización, transparencia e intimidad',
      },
    },
    question:
      '¿Qué valoración jurídica corresponde a esta medida según la LOPDGDD y el RGPD?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Es ilícita y desproporcionada: está prohibido instalar sistemas de videovigilancia o grabación de sonidos en zonas de descanso, vestuarios o aseos, y es obligatorio informar de forma previa, expresa y clara sobre el tratamiento.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Es válida siempre que la grabación de audio se borre cada 90 días y los empleados hayan firmado un contrato laboral estándar.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Solo es ilegal la cámara del vestuario; la grabación continua de conversaciones privadas en el comedor está amparada por el interés legítimo.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Es lícita si las imágenes únicamente las revisa el departamento de recursos humanos los viernes.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'La medida vulnera de forma grave el RGPD y las garantías específicas de derechos digitales en el ámbito laboral de la LOPDGDD. Está expresamente vedada la instalación de sistemas de videovigilancia o captación de audio en lugares destinados al descanso o esparcimiento de los trabajadores (como vestuarios, aseos o comedores), la grabación indiscriminada de sonidos supone una injerencia desproporcionada en la intimidad, y la ausencia total de información previa vulnera el principio de transparencia.',
    legalContext:
      'La Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) regula específicamente el derecho a la intimidad frente al uso de dispositivos de videovigilancia y grabación de sonidos en el lugar de trabajo, prohibiendo su instalación en espacios destinados al descanso o esparcimiento (vestuarios, aseos, comedores) y exigiendo información previa, expresa, clara y concisa, en coherencia con los principios de minimización y proporcionalidad del RGPD.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'derecho-supresion-olvido',
    title: 'Caso 07: Negativa a suprimir datos obsoletos en portal público',
    category: 'digital_law',
    difficulty: 'inicial',
    xpReward: 130,
    basePoints: 160,
    brief:
      'Una ciudadana ejerce su derecho de supresión frente a un directorio web que sigue publicando una antigua deuda tributaria de hace 9 años ya liquidada y cancelada, lo que perjudica su búsqueda de empleo.',
    artifactType: 'legal_dossier',
    artifactData: {
      subject: 'Solicitud de ejercicio de derechos ARSLPOP — Supresión',
      body:
        'Respuesta recibida del portal:\n"Denegamos su solicitud porque los datos fueron obtenidos inicialmente de un boletín oficial público hace nueve años y nuestra política interna establece un interés legítimo indefinido para mantener el archivo histórico completo."',
      metadata: {
        'Estado del dato': 'Deuda saldada y obsoleta',
        'Vía administrativa en España': 'Reclamación de tutela de derechos ante la AEPD',
      },
    },
    question:
      '¿Asiste la razón al ciudadano y qué vía jurídica procede si el responsable mantiene la negativa tras el plazo legal?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Sí le asiste el derecho de supresión ("derecho al olvido") porque la finalidad original dejó de ser necesaria y los datos son obsoletos y lesivos; si no responden o deniegan injustificadamente en un mes, puede reclamar tutela ante la AEPD.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'No procede la supresión porque cualquier dato que haya aparecido una vez en un boletín oficial puede republicarse comercialmente de por vida sin límites.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'El interesado debe contratar obligatoriamente un procurador y demandar ante el Tribunal de Justicia de la UE como primer paso.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Solo puede solicitar la portabilidad de los datos a otro directorio competidor, pero nunca su eliminación.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'El tratamiento continuado de datos desactualizados sobre una deuda ya satisfecha carece de base legítima que prevalezca sobre los derechos de la interesada, especialmente cuando causa un perjuicio desproporcionado. Bajo el RGPD y la LOPDGDD, el responsable debe atender el derecho de supresión en el plazo de un mes (prorrogable por dos más en casos complejos) o motivar una excepción legal válida; ante la negativa injustificada, la ciudadana puede presentar reclamación gratuita de tutela ante la AEPD.',
    legalContext:
      'El RGPD y la LOPDGDD reconocen el derecho de supresión ("derecho al olvido") cuando los datos ya no son necesarios para los fines para los que fueron recogidos o cuando prevalecen los intereses y derechos del interesado frente al interés legítimo alegado. El responsable dispone con carácter general de un mes para resolver la solicitud, pudiendo el ciudadano acudir ante la AEPD en caso de desatención o denegación indebida.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'acceso-ilicito-exempleado',
    title: 'Caso 08: Acceso no autorizado de exempleado a correo y clientes',
    category: 'digital_law',
    difficulty: 'intermedio',
    xpReward: 185,
    basePoints: 220,
    brief:
      'Dos semanas después de causar baja voluntaria, un antiguo comercial utiliza su cuenta VPN y buzón corporativo —que IT olvidó deshabilitar— para descargar el listado completo de clientes, tarifas confidenciales y contratos.',
    artifactType: 'incident_log',
    artifactData: {
      subject: 'Registros de auditoría de acceso VPN y correo',
      headers: [
        'Usuario: m.torres@empresa-industrial.es (Estado RR.HH.: Baja hace 14 días)',
        'Evento: Exportación PST de 4,2 GB y descarga de CRM desde IP residencial externa',
        'Horario: 02:14 AM',
      ],
      body:
        'El equipo forense confirma que el usuario ya había firmado cláusula de confidencialidad y devolvió el portátil corporativo, accediendo desde su equipo personal aprovechando la falta de revocación de credenciales y ausencia de MFA.',
      metadata: {
        'Impacto': 'Exfiltración de secretos empresariales y datos personales de contactos B2B',
      },
    },
    question:
      '¿Qué implicaciones jurídicas y técnicas convergen en este incidente en España?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Existen indicios de delito de acceso ilícito a sistemas informáticos y descubrimiento/revelación de secretos empresariales (Código Penal español), además de vulneración de la seguridad por falta de revocación de accesos (Offboarding) y brecha potencial de datos personales.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Al no haberse borrado la cuenta por error de IT, el exempleado mantenía autorización legal tácita para descargar las bases de datos.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Solo constituye una falta leve de puntualidad sin relevancia penal ni en materia de protección de datos.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'La empresa debe borrar inmediatamente los logs de acceso VPN para evitar responsabilidades de privacidad del exempleado.',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'Que una credencial siga técnicamente activa por un fallo de offboarding no otorga autorización jurídica de acceso tras finalizar la relación laboral. El acceso sin autorización vulnerando la voluntad del titular y la apropiación de secretos empresariales y listados confidenciales puede generar responsabilidad penal en España (acceso ilícito a sistemas / revelación de secretos) y civil por competencia desleal y violación de secretos empresariales. Técnicamente exige preservación de evidencias forenses (cadena de custodia, nunca borrar logs), revocación inmediata de accesos, MFA y análisis de brecha RGPD.',
    legalContext:
      'El Código Penal español tipifica tanto el acceso sin autorización a sistemas de información vulnerando medidas o autorizaciones como el apoderamiento y revelación de secretos de empresa, complementado por la Ley de Secretos Empresariales en España. Adicionalmente, la falta de control de accesos y bajas (offboarding) incumple las medidas técnicas de seguridad exigidas por el RGPD.',
    isActive: true,
    createdBy: 'system',
  },
  {
    slug: 'nis2-incidente-cadena-suministro',
    title: 'Caso 09: Ransomware en proveedor crítico bajo marco NIS2 y ENS',
    category: 'digital_law',
    difficulty: 'avanzado',
    xpReward: 240,
    basePoints: 300,
    brief:
      'Una operadora energética considerada entidad esencial en España sufre la interrupción de su sistema de telecontrol tras un ransomware propagado desde la cuenta de mantenimiento remoto de un proveedor tecnológico.',
    artifactType: 'legal_dossier',
    artifactData: {
      subject: 'Crisis de Continuidad y Cumplimiento — Sector Energía',
      body:
        'Situación a las 4 horas del incidente:\n- El ransomware ha cifrado servidores de operación secundaria y degradado la telemetría.\n- El acceso inicial se produjo mediante credenciales compartidas del proveedor externo sin segmentación.\n- El consejo de administración pregunta qué obligaciones regulatorias aplican en la Unión Europea y España.',
      metadata: {
        'Marco regulatorio': 'Directiva europea NIS2 y Esquema Nacional de Seguridad / normativa de infraestructuras críticas',
        'Tipo de entidad': 'Entidad esencial (sector energía)',
      },
    },
    question:
      '¿Qué combinación de obligaciones de gobernanza, cadena de suministro y notificación exige el marco europeo NIS2?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Exige gestión de riesgos en la cadena de suministro (proveedores), medidas de continuidad y control de accesos, responsabilidad directa del órgano de dirección y un sistema de notificación escalonada con alerta temprana en 24 horas al CSIRT o autoridad competente.',
      },
      {
        id: 'b',
        label: 'B',
        text: 'NIS2 solo aplica a redes sociales estadounidenses y no incluye deberes sobre proveedores ni plazos de alerta temprana.',
      },
      {
        id: 'c',
        label: 'C',
        text: 'La directiva recomienda pagar el rescate de inmediato para eximir a la dirección de cualquier supervisión regulatoria.',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Solo obliga a publicar un informe anual voluntario sin intervención de los equipos nacionales de respuesta a incidentes (CSIRT).',
      },
    ],
    correctOptionId: 'a',
    referenceSolution:
      'La Directiva europea NIS2 eleva los requisitos de ciberseguridad para entidades esenciales e importantes, imponiendo: 1) seguridad en la cadena de suministro y relaciones con proveedores (acceso privilegiado mínimo, MFA, segmentación), 2) responsabilidad y formación de los órganos de dirección, 3) notificación escalonada de incidentes significativos (alerta temprana en 24 horas, notificación del incidente en 72 horas e informe final al mes) ante el CSIRT/autoridad nacional competente, en sinergia en España con el Esquema Nacional de Seguridad (ENS) cuando aplica.',
    legalContext:
      'La Directiva (UE) NIS2 sobre medidas destinadas a garantizar un elevado nivel común de ciberseguridad en toda la Unión establece obligaciones estrictas para sectores esenciales (como energía, transporte o sanidad) en materia de gestión de riesgos, seguridad de la cadena de suministro, implicación del órgano de administración y notificación rápida de incidentes significativos (alerta temprana en 24h y actualización en 72h) a los CSIRT y autoridades nacionales competentes, articulándose en España con el marco de seguridad nacional y el Esquema Nacional de Seguridad (ENS).',
    isActive: true,
    createdBy: 'system',
  },
];

export async function getDefaultSeedUsers() {
  const playerHash = await bcrypt.hash('Detective2026!', 12);
  const adminHash = await bcrypt.hash('AdminSOC2026!', 12);

  return [
    {
      codename: 'Agente_Vega',
      email: 'detective@ciberdetective.es',
      passwordHash: playerHash,
      role: 'player' as const,
      xp: 310,
      level: 2,
      totalScore: 350,
      missionsCompleted: 2,
      missionsCorrect: 2,
      streak: 2,
      bestStreak: 2,
      unlockedAchievements: ['FIRST_CASE'],
      categoryStats: {
        phishingSolved: 1,
        privacySolved: 1,
        digitalLawSolved: 0,
      },
    },
    {
      codename: 'Director_SOC',
      email: 'admin@ciberdetective.es',
      passwordHash: adminHash,
      role: 'admin' as const,
      xp: 850,
      level: 4,
      totalScore: 920,
      missionsCompleted: 5,
      missionsCorrect: 5,
      streak: 5,
      bestStreak: 5,
      unlockedAchievements: [
        'FIRST_CASE',
        'PHISHING_HUNTER',
        'PRIVACY_GUARDIAN',
        'STREAK_3',
        'SOC_SENIOR',
      ],
      categoryStats: {
        phishingSolved: 2,
        privacySolved: 2,
        digitalLawSolved: 1,
      },
    },
  ];
}
