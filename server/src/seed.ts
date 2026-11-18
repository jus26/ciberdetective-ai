import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.ts';
import { Badge } from './models/Badge.ts';
import { Mission } from './models/Mission.ts';
import { User } from './models/User.ts';

dotenv.config();

const SEED_BADGES = [
  {
    codigo: 'PRIMER_EXPEDIENTE',
    nombre: 'Primer Expediente Cerrado',
    descripcion: 'Aprueba tu primera misión operativa en CiberDetective AI.',
    icono: 'shield-check',
    condicionTipo: 'misiones_aprobadas',
    condicionValor: 1,
  },
  {
    codigo: 'CAZADOR_PHISHING',
    nombre: 'Escudo Anti-Phishing',
    descripcion: 'Resuelve con éxito un caso de suplantación y fraude por correo.',
    icono: 'mail-warning',
    condicionTipo: 'categoria_phishing',
    condicionValor: 1,
  },
  {
    codigo: 'GUARDIAN_RGPD',
    nombre: 'Guardián de la Privacidad',
    descripcion: 'Supera 2 misiones de protección de datos, brechas o cookies.',
    icono: 'lock',
    condicionTipo: 'categoria_privacidad',
    condicionValor: 2,
  },
  {
    codigo: 'JURISTA_DIGITAL',
    nombre: 'Jurista Digital',
    descripcion: 'Aprueba 2 casos de derecho digital español y europeo.',
    icono: 'scale',
    condicionTipo: 'categoria_derecho_digital',
    condicionValor: 2,
  },
  {
    codigo: 'PERITO_FORENSE',
    nombre: 'Perito Forense SOC',
    descripcion: 'Completa con éxito una investigación forense de incidentes críticos.',
    icono: 'file-search',
    condicionTipo: 'categoria_forense',
    condicionValor: 1,
  },
  {
    codigo: 'DICTAMEN_EXPERTO',
    nombre: 'Dictamen Impecable',
    descripcion: 'Obtén una puntuación mínima de 90/100 en cualquier misión.',
    icono: 'award',
    condicionTipo: 'puntuacion_minima',
    condicionValor: 90,
  },
  {
    codigo: 'AUDITOR_IGUALDAD',
    nombre: 'Auditor/a de Equidad Digital',
    descripcion:
      'Resuelve con éxito 3 misiones sobre igualdad de trato, brecha digital y no discriminación.',
    icono: 'scale',
    condicionTipo: 'categoria_derecho_digital',
    condicionValor: 3,
  },
  {
    codigo: 'CAZASESGOS_IA',
    nombre: 'Cazador/a de Sesgos Algorítmicos',
    descripcion:
      'Completa 2 auditorías forenses detectando prácticas discriminatorias indirectas en sistemas tecnológicos.',
    icono: 'shield-check',
    condicionTipo: 'categoria_forense',
    condicionValor: 2,
  },
  {
    codigo: 'ECO_DETECTIVE',
    nombre: 'Detective Ambiental',
    descripcion:
      'Resuelve 3 investigaciones forenses sobre greenwashing, emisiones manipuladas o fraude ecológico.',
    icono: 'leaf',
    condicionTipo: 'categoria_forense',
    condicionValor: 3,
  },
  {
    codigo: 'CIRCULAR_MASTER',
    nombre: 'Maestro de la Economía Circular',
    descripcion:
      'Supera 4 misiones de derecho digital protegiendo el ecodiseño, la Agenda 2030 y los límites planetarios.',
    icono: 'refresh-cw',
    condicionTipo: 'categoria_derecho_digital',
    condicionValor: 4,
  },
] as const;

const SEED_MISSIONS = [
  {
    titulo: 'Caso 01: Phishing bancario con cabecera SPF y DMARC fallida',
    descripcion:
      'Una clienta de banca online española recibe un correo urgente alertando de la suspensión inmediata de su tarjeta por un supuesto cargo retenido en el extranjero.',
    categoria: 'phishing',
    dificultad: 'facil',
    tiempoLimiteSegundos: 300,
    xpRecompensa: 120,
    evidencias: {
      correosSimulados: [
        {
          remitente: 'Seguridad BancoIberia <alertas@bancoiberia-verificacion.com>',
          destinatario: 'laura.gomez@correo.es',
          asunto: 'URGENTE: Verificación obligatoria en 2 horas o bloqueo definitivo',
          cabeceras: [
            'Return-Path: <bounce-941@vps-mailer-eu.xyz>',
            'Received: from mail.vps-mailer-eu.xyz (194.169.175.22)',
            'Authentication-Results: spf=fail (domain of bancoiberia-verificacion.com does not designate 194.169.175.22 as permitted sender); dkim=none; dmarc=fail',
            'Reply-To: soporte-incidencias@gmail.com',
          ],
          cuerpo:
            'Estimado cliente,\n\nHemos detectado un acceso inusual a su cuenta. Para evitar el bloqueo permanente en las próximas 2 horas, valide su DNI, clave de acceso y código SMS de confirmación en:\nhttps://bancoiberia.acceso-clientes-seguro.com/validar\n\nDepartamento de Prevención de Fraude.',
        },
      ],
      logs: [
        'DNS lookup bancoiberia-verificacion.com -> dominio registrado hace 3 días en registrador extranjero.',
        'Dominio legítimo de la entidad: bancoiberia.es',
      ],
      metadatos: {
        'Vector de ataque': 'Phishing bancario (robo de credenciales + OTP)',
        'Estado SPF/DKIM/DMARC': 'spf=fail / dkim=none / dmarc=fail',
      },
      extractosLegales: [
        'Estafa informática en el Código Penal español y suplantación fraudulenta para obtener códigos de autenticación.',
      ],
    },
    preguntaPrincipal:
      'A la vista de las cabeceras técnicas y del contenido del mensaje, ¿cuál es el diagnóstico correcto y la actuación inmediata recomendada?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Es un ataque de phishing con dominio falso y autenticación SPF/DMARC fallida; no debe pulsarse el enlace y hay que verificar el estado real accediendo manualmente desde la app o web oficial del banco y reportar el correo.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'El dominio termina en .com con certificado HTTPS, por lo que basta con introducir únicamente el DNI sin la contraseña.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'El fallo SPF=fail indica únicamente un retraso del servidor del banco; conviene responder al campo Reply-To preguntando el importe del cargo.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Debe reenviarse el enlace a familiares para comprobar si también tienen el mismo aviso de seguridad.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Se trata de un correo fraudulento de phishing bancario. Los indicadores forenses clave son: 1) dominio distinto al oficial (bancoiberia-verificacion.com y enlace externo acceso-clientes-seguro.com), 2) fallo explícito en SPF y DMARC (spf=fail, dmarc=fail) y ausencia de firma DKIM, 3) Reply-To desviado a una cuenta gratuita de Gmail, y 4) urgencia psicológica solicitando credenciales y código OTP. Nunca se debe pulsar el enlace; se debe acceder exclusivamente por canal oficial, bloquear el remitente y, si se hubieran introducido datos, avisar de inmediato a la entidad bancaria y denunciar ante las Fuerzas y Cuerpos de Seguridad.',
    marcoLegalReal:
      'En España, el phishing orientado al desvío de fondos o captación ilícita de credenciales mediante engaño se encuadra en la estafa informática regulada por el Código Penal español, junto con la normativa europea y española sobre servicios de pago (autenticación reforzada de clientes PSD2 y régimen de operaciones no autorizadas).',
    activa: true,
  },
  {
    titulo: 'Caso 02: Brecha de datos personales y plazo RGPD de 72 horas',
    descripcion:
      'Una clínica privada española descubre el lunes a las 08:30 que un servidor de historias clínicas estuvo accesible en Internet sin contraseña durante 48 horas, registrándose descargas desde IPs externas.',
    categoria: 'privacidad',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 170,
    evidencias: {
      logs: [
        '[2026-11-16 08:30:12] SOC-ALERT: Bucket clínico accesible públicamente sin autenticación.',
        '[2026-11-16 09:05:44] FORENSIC: Exportados 3.420 registros (Nombre, DNI, teléfono, diagnósticos médicos).',
        '[2026-11-16 09:12:00] IP de descarga externa: 45.142.212.90 (sin relación con la clínica).',
      ],
      metadatos: {
        'Categoría de datos': 'Datos identificativos + datos relativos a la salud (categoría especial)',
        'Autoridad de control en España': 'Agencia Española de Protección de Datos (AEPD)',
      },
      extractosLegales: [
        'RGPD: Obligación de notificar violaciones de seguridad de datos personales a la autoridad de control competente en un plazo máximo de 72 horas desde que se tenga constancia, salvo que sea improbable que constituya un riesgo.',
        'RGPD y LOPDGDD: Comunicación sin dilación indebida a los interesados cuando la brecha entrañe un alto riesgo para sus derechos y libertades.',
      ],
    },
    preguntaPrincipal:
      'La dirección pretende esperar dos semanas a cerrar la auditoría completa antes de informar. ¿Qué exige la normativa de protección de datos?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Notificar la brecha a la AEPD sin dilación indebida y como máximo en 72 horas (ampliando detalles por fases si la investigación continúa), y comunicarla además a los pacientes afectados al existir alto riesgo por exponerse datos de salud y DNI.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Esperar 14 días hábiles hasta finalizar el informe forense definitivo antes de contactar con la AEPD o con los pacientes.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Como ya se cerró el acceso al servidor tras detectarse el fallo, queda extinguida la obligación de notificar a la AEPD.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Publicar un aviso genérico en la recepción física de la clínica exime de la notificación ante la autoridad de control.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Al haberse exfiltrado datos identificativos junto con datos de salud (categoría especial de datos), existe un riesgo muy elevado para los derechos y libertades de los pacientes. El RGPD exige notificar a la autoridad de control competente (AEPD en España) sin dilación indebida y a más tardar en 72 horas desde que se tuvo constancia, pudiendo aportar información adicional de manera escalonada. Además, al concurrir un alto riesgo, debe comunicarse también directamente a los afectados con recomendaciones claras para protegerse.',
    marcoLegalReal:
      'Reglamento General de Protección de Datos (RGPD) de la Unión Europea y Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) en España. Establecen el plazo máximo de 72 horas para notificar brechas de seguridad a la AEPD, la posibilidad de notificación por fases, el deber de documentación interna de toda brecha y la comunicación a los interesados ante alto riesgo, especialmente cuando afecta a categorías especiales de datos como la salud.',
    activa: true,
  },
  {
    titulo: 'Caso 03: Suplantación de identidad y difusión no consentida en redes',
    descripcion:
      'Un perfil anónimo en una red social utiliza el nombre completo, fotografía profesional y cargo de una directiva para enviar mensajes difamatorios y solicitar dinero a contactos del sector.',
    categoria: 'derecho_digital',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 180,
    evidencias: {
      metadatos: {
        'Hechos': 'Creación de cuenta falsa usando nombre real, fotografía personal y suplantación activa frente a terceros.',
        'Perjuicio': 'Solicitud fraudulenta de transferencias y daño reputacional directo.',
      },
      extractosLegales: [
        'Protección de datos (RGPD/LOPDGDD): Uso ilícito de imagen y datos personales sin base de legitimación.',
        'Código Penal español: Posible concurrencia de delitos de estafa (si media engaño patrimonial), usurpación del estado civil cuando se actúa asumiendo integralmente la personalidad ajena o delitos contra el honor / acoso según la conducta concreta.',
        'Canal prioritario de la AEPD y retirada urgente ante la plataforma prestadora de servicios.',
      ],
    },
    preguntaPrincipal:
      '¿Cuál es la estrategia técnico-jurídica adecuada para preservar pruebas, frenar la suplantación y defender los derechos de la víctima en España?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Preservar evidencias con validez probatoria (URLs, capturas con sellado o acta notarial/pericial antes de que borren la cuenta), solicitar la retirada urgente a la plataforma por suplantación, ejercer derechos RGPD/canal prioritario de la AEPD si procede e interponer denuncia policial.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Contratar a un tercero para hackear la cuenta falsa y borrarla directamente sin avisar a la plataforma ni a la policía.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'No puede hacerse nada legalmente porque crear perfiles con fotos públicas de Internet es siempre un ejercicio protegido de libertad creativa.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Responder públicamente con insultos desde la cuenta real y esperar 6 meses sin guardar capturas de los mensajes.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Ante una suplantación activa en redes sociales con petición de dinero y daño reputacional, lo primero es asegurar la prueba digital (URL exacta del perfil, capturas de pantalla, identificadores de usuario y testigos o certificación de contenidos) antes de que la plataforma elimine el perfil y desaparezcan los indicios visibles. A continuación, se reporta el abuso por suplantación a la red social, se avisa a los contactos para evitar fraudes, se acude a las Fuerzas y Cuerpos de Seguridad para denunciar los hechos (posible estafa/acoso/usurpación según alcance) y se puede instar la protección de imagen y datos personales ante la AEPD si hay difusión ilícita de contenido sensible.',
    marcoLegalReal:
      'En el ordenamiento español confluyen: el RGPD y la LOPDGDD (tratamiento ilícito de imagen y datos personales), la Ley de Servicios Digitales europea (DSA) y LSSI-CE sobre mecanismos de notificación y retirada de contenidos ilícitos en plataformas, la protección civil del derecho al honor, a la intimidad y a la propia imagen, y el Código Penal español respecto a fraudes/estafas, usurpación del estado civil o delitos contra el honor cuando concurran sus requisitos.',
    activa: true,
  },
  {
    titulo: 'Caso 04: Ransomware en pyme e investigación forense de intrusión',
    descripcion:
      'A las 03:10 de la madrugada, los servidores de archivos y el ERP de una pyme manufacturera aparecen cifrados con extensión .locked y una nota exigiendo rescate en criptomonedas.',
    categoria: 'forense',
    dificultad: 'experto',
    tiempoLimiteSegundos: 420,
    xpRecompensa: 240,
    evidencias: {
      logs: [
        '[01:12:04] RDP-AUTH FAIL user=Administrador src=185.199.108.153 (240 intentos/min)',
        '[01:18:49] RDP-AUTH SUCCESS user=soporte_temp src=185.199.108.153 (MFA: disabled)',
        '[01:24:10] POWERSHELL EncodedCommand executed -> download payload',
        '[02:02:33] VSSADMIN delete shadows /all /quiet (eliminación de copias locales)',
        '[02:15:00] EXFILTRATION 18.4 GB outbound HTTPS to unknown cloud storage',
        '[03:10:02] Mass file encryption started across \\\\SRV-FILES\\Comercial',
      ],
      metadatos: {
        'Vector de entrada': 'Puerto RDP (3389) expuesto a Internet sin MFA y cuenta temporal activa',
        'Indicador clave': 'Exfiltración previa de 18,4 GB antes del cifrado (doble extorsión)',
      },
      extractosLegales: [
        'RGPD: Al haberse exfiltrados datos corporativos con posible contenido personal, el incidente supera el mero cifrado local y exige evaluar notificación de brecha de confidencialidad en 72h.',
        'Guías de INCIBE / CCN-CERT: Se desaconseja pagar el rescate (no garantiza recuperación, financia al cibercrimen y no exime de obligaciones legales).',
      ],
    },
    preguntaPrincipal:
      'Analizando los logs forenses, ¿cuál fue el vector de acceso, qué ocurrió antes del cifrado y qué secuencia de contención es correcta?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Entraron por RDP sin MFA usando la cuenta soporte_temp, eliminaron copias sombra (vssadmin) y exfiltraron 18,4 GB (doble extorsión); hay que aislar sistemas de red sin destruir evidencias volátiles, revocar credenciales, evaluar notificación RGPD en 72h, restaurar desde backups inmutables offline y denunciar sin pagar el rescate.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'El ataque entró por un fallo del antivirus local; basta con formatear de inmediato todos los discos antes de revisar los logs y pagar el rescate para cerrar el caso legalmente.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Al haberse ejecutado vssadmin únicamente se perdieron archivos temporales; no existe riesgo de fuga de datos ni obligación de analizar el RGPD.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Conviene dejar el servidor conectado a Internet durante 48 horas mientras se negocia con los atacantes sin deshabilitar la cuenta soporte_temp.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Los logs muestran un patrón típico de ransomware con doble extorsión: fuerza bruta sobre RDP expuesto a Internet, acceso legítimo abusado mediante la cuenta soporte_temp sin MFA, ejecución de PowerShell ofuscado, borrado de Volume Shadow Copies (vssadmin) para impedir la restauración local y exfiltración saliente de 18,4 GB previa al cifrado. La respuesta forense adecuada consiste en aislar de red los equipos comprometidos preservando memoria/logs (cadena de custodia), bloquear IPs y revocar cuentas, restaurar desde copias inmutables/offline tras verificar la erradicación del atacante, notificar la brecha a la AEPD en 72h si hay datos personales exfiltrados, denunciar ante las autoridades y coordinarse con INCIBE/CSIRT sin ceder al pago del rescate.',
    marcoLegalReal:
      'En España y la UE, un ransomware con exfiltración de datos implica tanto una brecha de disponibilidad como de confidencialidad bajo el RGPD y la LOPDGDD (notificación en 72h a la AEPD y, si hay alto riesgo, a los afectados), constituye delitos graves de daños informáticos, acceso ilícito y extorsión en el Código Penal español, y requiere preservación de evidencias digitales para la investigación policial y el cumplimiento de deberes de diligencia corporativa.',
    activa: true,
  },
  {
    titulo: 'Caso 05: Ejercicio del derecho de supresión ("Derecho al olvido")',
    descripcion:
      'Un ciudadano solicita a un portal de hemeroteca comercial y a un buscador la desindexación y supresión de una noticia antigua sobre una sanción administrativa menor de hace 11 años ya prescrita y cancelada.',
    categoria: 'derecho_digital',
    dificultad: 'facil',
    tiempoLimiteSegundos: 300,
    xpRecompensa: 130,
    evidencias: {
      metadatos: {
        'Solicitante': 'Ciudadano particular sin relevancia pública',
        'Antigüedad del dato': '11 años; procedimiento ya finalizado y sin interés informativo actual',
      },
      extractosLegales: [
        'RGPD y LOPDGDD: Derecho de supresión ("derecho al olvido") aplicable cuando los datos ya no son necesarios o prevalece la privacidad del ciudadano particular frente a información obsoleta.',
        'Plazo de respuesta del responsable: 1 mes con carácter general (prorrogable 2 meses en casos complejos), con posibilidad de reclamación ante la AEPD en caso de denegación.',
      ],
    },
    preguntaPrincipal:
      '¿Cómo debe resolverse la solicitud ponderando el derecho al olvido y la libertad de información?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Procede estimar la solicitud de supresión/desindexación por tratarse de un particular, ser información obsoleta de hace 11 años ya resuelta y causar un perjuicio desproporcionado; si se deniega o no se responde en un mes, puede reclamar tutela ante la AEPD.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'El derecho al olvido solo existe para menores de edad y nunca frente a buscadores o archivos digitales.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Cualquier hecho que ocurrió alguna vez debe permanecer indexado por nombre y apellidos de forma perpetua sin ponderación alguna.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'El interesado solo puede ejercer el derecho de portabilidad para mover la noticia a otro buscador.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'El derecho de supresión (conocido como derecho al olvido en búsquedas por nombre y apellidos) exige ponderar entre la libertad de información y la privacidad del afectado. Al tratarse de un ciudadano sin proyección pública y de una sanción menor de hace 11 años ya cancelada, los datos resultan inadecuados, no pertinentes y excesivos por el paso del tiempo, por lo que prevalece el derecho a la desindexación/supresión. El responsable tiene un plazo general de un mes para contestar y, ante una negativa injustificada, el ciudadano puede presentar reclamación gratuita de tutela de derechos ante la AEPD.',
    marcoLegalReal:
      'Regulado por el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) en España (incluido el derecho al olvido en búsquedas de Internet y servicios de redes sociales), con supervisión y tutela gratuita por parte de la Agencia Española de Protección de Datos (AEPD).',
    activa: true,
  },
  {
    titulo: 'Caso 06: Cláusulas abusivas y patrones oscuros en banner de cookies',
    descripcion:
      'Una plataforma española de comercio electrónico muestra un aviso de cookies con un botón grande "ACEPTAR Y CONTINUAR", sin botón de rechazo visible, y preactiva 40 socios publicitarios alegando "interés legítimo" y "seguir navegando implica aceptar".',
    categoria: 'privacidad',
    dificultad: 'medio',
    tiempoLimiteSegundos: 330,
    xpRecompensa: 165,
    evidencias: {
      metadatos: {
        'Diseño observado': 'Botón único de aceptación en primera capa; rechazo oculto tras 3 clics; cookies de perfilado activas antes de elegir.',
        'Fórmula usada': '"Si continúa navegando consideraremos que acepta todas nuestras condiciones."',
      },
      extractosLegales: [
        'RGPD y LSSI-CE: El consentimiento debe ser libre, específico, informado e inequívoco mediante una acción afirmativa clara.',
        'Criterios de la AEPD sobre cookies: La opción de rechazar las cookies no necesarias debe estar al mismo nivel y con la misma facilidad visual que la de aceptar; no es válido "seguir navegando" ni las casillas premarcadas.',
      ],
    },
    preguntaPrincipal:
      '¿Qué infracciones jurídicas presenta este diseño de consentimiento de cookies y qué cambio es obligatorio?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Incumple el RGPD, la LSSI-CE y los criterios de la AEPD: "seguir navegando" no es consentimiento válido, no pueden cargarse cookies no esenciales antes del permiso ni usarse patrones oscuros; debe incluirse un botón equivalente de "Rechazar todo" en la primera capa.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Es válido porque menciona en letra pequeña que el usuario puede desactivar las cookies desde la configuración interna de su navegador.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'El interés legítimo permite instalar cookies publicitarias de terceros sin consentimiento previo en tiendas online españolas.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Solo sería irregular si faltara el aviso de copyright en el pie de página del sitio web.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Un banner asimétrico que oculta el rechazo o considera consentimiento el simple hecho de navegar constituye un patrón oscuro contrario a la normativa española y europea. Bajo el RGPD y la LSSI-CE, las cookies analíticas o publicitarias no esenciales requieren consentimiento previo, libre e inequívoco antes de instalarse. Siguiendo los criterios de la AEPD, en la primera capa debe ofrecerse una opción de rechazo ("Rechazar todas") tan visible, accesible y sencilla como la de aceptación ("Aceptar todas"), sin casillas premarcadas ni bloqueos coercitivos sin alternativa equivalente.',
    marcoLegalReal:
      'En España rigen la Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE) para la instalación de dispositivos de almacenamiento y recuperación de datos (cookies), en conexión directa con los requisitos de validez del consentimiento del RGPD y la Guía sobre el uso de las cookies de la Agencia Española de Protección de Datos (AEPD).',
    activa: true,
  },
  {
    titulo: 'Caso 07: Phishing en ofertas de empleo transfronterizas (Red EURES)',
    descripcion:
      'Un demandante de empleo en España recibe un correo que simula proceder de la red europea de movilidad laboral EURES ofreciéndole un contrato inmediato en Irlanda, pero exigiéndole transferir 290 euros por adelantado para "tasas de registro europeo" y enviar copia de su DNI y datos bancarios.',
    categoria: 'phishing',
    dificultad: 'facil',
    tiempoLimiteSegundos: 330,
    xpRecompensa: 150,
    evidencias: {
      correosSimulados: [
        {
          remitente:
            'EURES Movilidad Europea <rrhh@eures-empleo-europa-gestion.com>',
          destinatario: 'carlos.mendez@correo.es',
          asunto:
            'Preselección confirmada en Dublín · Envío urgente de DNI, IBAN y tasa de alta EURES',
          cabeceras: [
            'Return-Path: <empleo-eu@mailer-ofertas-fast.xyz>',
            'Received: from mail.mailer-ofertas-fast.xyz (91.215.85.140)',
            'Authentication-Results: spf=fail (domain of eures-empleo-europa-gestion.com does not authorize 91.215.85.140); dkim=none; dmarc=fail',
            'Reply-To: contratacion.eures.eu@gmail.com',
          ],
          cuerpo:
            'Estimado candidato,\n\nSu perfil ha sido seleccionado en el programa de movilidad EURES para un puesto en Dublín (3.200 €/mes). Para formalizar el alta europea antes de 24 horas y reservar alojamiento, responda adjuntando copia de su DNI por ambas caras, número de cuenta IBAN y justificante de pago de 290 EUR en concepto de tasa de tramitación.\n\nDepartamento de Colocación Internacional.',
        },
      ],
      logs: [
        'WHOIS eures-empleo-europa-gestion.com -> dominio privado registrado hace 4 días; NO pertenece al dominio oficial institucional eures.europa.eu.',
        'Authentication-Results -> spf=fail / dmarc=fail / Reply-To desviado a proveedor gratuito (@gmail.com).',
        'Verificación Red EURES / SEPE -> Los servicios públicos de empleo y el portal EURES son totalmente gratuitos para los candidatos y jamás exigen pagos previos.',
      ],
      metadatos: {
        'Guía aplicada':
          'Miniguía de Candidaturas Seguras (Manual de Derechos Fundamentales UE y Red EURES)',
        'Canal oficial verificado':
          'Portal oficial EURES (eures.europa.eu) y Consejeros EURES del SEPE',
        'Riesgo principal':
          'Estafa económica por adelanto de tasas y robo de identidad (DNI + IBAN)',
      },
      extractosLegales: [
        'Carta de los Derechos Fundamentales de la Unión Europea, Artículo 8 (Protección de datos de carácter personal): Toda persona tiene derecho a la protección de los datos de carácter personal que la conciernan; estos datos se tratarán de modo leal, para fines concretos y sobre la base del consentimiento o de otro fundamento legítimo previsto por la ley.',
        'Miniguía de Candidaturas Seguras (Red EURES): Desconfiar siempre de ofertas que exijan pagos por adelantado, remisión urgente de documentación de identidad (DNI/pasaporte) o datos bancarios a cuentas no oficiales; verificar toda oferta a través del portal oficial eures.europa.eu o de un consejero EURES.',
        'Código Penal español: Estafa informática y usurpación o captación fraudulenta de datos personales e identidad.',
      ],
    },
    preguntaPrincipal:
      'Aplicando la Miniguía de Candidaturas Seguras y el marco europeo de protección de datos, ¿qué diagnóstico y actuación son correctos ante esta oferta supuestamente vinculada a EURES?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Es una estafa de phishing laboral que suplanta a la Red EURES: no debe realizarse ningún pago ni enviarse el DNI o IBAN (vulneraría la protección de datos del Art. 8 de la Carta de la UE); hay que comprobar la oferta únicamente en eures.europa.eu o con un consejero EURES del SEPE y denunciar el fraude.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Enviar primero solo el DNI y esperar a recibir el contrato para abonar la tasa europea de 290 euros al correo Reply-To de Gmail.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'La Red EURES cobra habitualmente tasas administrativas previas por cada candidatura internacional, por lo que el correo es legítimo aunque falle el registro SPF.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'El Artículo 8 de la Carta de la UE obliga a entregar copias del DNI a cualquier empresa privada antes de verificar su dominio institucional.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Se trata de un intento de phishing laboral que suplanta a la Red EURES. Siguiendo la Miniguía de Candidaturas Seguras del Manual UE y Red EURES: 1) la Red EURES y los servicios públicos de empleo europeos (como el SEPE en España) son gratuitos y jamás solicitan pagos por adelantado; 2) las cabeceras revelan dominio no institucional (.com reciente frente a eures.europa.eu), fallo SPF/DMARC y desvío a una cuenta Gmail; 3) entregar el DNI y el IBAN expone al candidato a suplantación de identidad y fraudes financieros, vulnerando la protección de datos personales (Artículo 8 de la Carta de los Derechos Fundamentales de la UE y RGPD). Debe descartarse el correo, contrastar cualquier vacante directamente en el portal oficial eures.europa.eu o mediante un consejero EURES, y reportar el intento de estafa informática.',
    marcoLegalReal:
      'Artículo 8 de la Carta de los Derechos Fundamentales de la Unión Europea (protección de datos de carácter personal y tratamiento leal y legítimo), Reglamento General de Protección de Datos (RGPD), estafa informática tipificada en el Código Penal español, y principios institucionales de la Red EURES (Comisión Europea / Autoridad Laboral Europea y SEPE en España) recogidos en la Miniguía de Candidaturas Seguras.',
    activa: true,
  },
  {
    titulo:
      'Caso 08: Discriminación laboral digital por filtros algorítmicos (Libre Circulación UE)',
    descripcion:
      'Una empresa tecnológica ubicada en otro Estado miembro de la UE automatiza la selección de personal mediante un algoritmo opaco que rechaza sistemáticamente las candidaturas procedentes de España basándose en el país de residencia, el prefijo telefónico +34 y la nacionalidad de origen.',
    categoria: 'derecho_digital',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 190,
    evidencias: {
      logs: [
        '[ATS-ENGINE] rule_id=geo_filter_04 -> condition: "country == ES || phone_prefix == +34 || university_country == ES" => action: AUTO_REJECT',
        '[ATS-AUDIT] 148 candidaturas españolas con cualificación equivalente descartadas en <200ms sin evaluación de méritos.',
        '[AUTO-MAILER] Mensaje enviado: "Su perfil no se ajusta a los requisitos de nacionalidad local del puesto."',
      ],
      metadatos: {
        'Práctica detectada':
          'Filtro algorítmico excluyente por nacionalidad y procedencia geográfica dentro de la UE',
        'Vías de reclamación UE':
          'Organismos nacionales de igualdad, tribunales nacionales, red de mediación SOLVIT y Red EURES',
        'Instituciones competentes':
          'Comisión Europea (guardiana de los Tratados), Tribunal de Justicia de la UE (TJUE) y Defensor del Pueblo Europeo (si intervienen instituciones UE)',
      },
      extractosLegales: [
        'Carta de los Derechos Fundamentales de la Unión Europea, Artículo 21 (No discriminación): Se prohíbe toda discriminación, y en particular por razón de nacionalidad en el ámbito de aplicación de los Tratados, sin perjuicio de disposiciones particulares.',
        'Reglamento (UE) n.º 492/2011 relativo a la libre circulación de los trabajadores dentro de la Unión: Garantiza la igualdad de trato en el acceso al empleo, prohíbe criterios encubiertos o algoritmos que discriminen a ciudadanos de otros Estados miembros y anula cláusulas discriminatorias.',
        'Mecanismos de defensa y apoyo en la UE: Organismos nacionales de igualdad y tribunales nacionales (que pueden plantear cuestión prejudicial al Tribunal de Justicia de la UE - TJUE), red informal y gratuita SOLVIT ante trabas administrativas o incumplimientos de autoridades públicas de otro Estado miembro, red EURES, Comisión Europea (denuncias por infracción del Derecho de la UE) y Defensor del Pueblo Europeo frente a mala administración de instituciones de la UE.',
      ],
    },
    preguntaPrincipal:
      '¿Qué vulneración del Derecho de la Unión Europea comete este filtro algorítmico y qué vías de reclamación y apoyo puede activar la persona afectada?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Vulnera el derecho a la igualdad y no discriminación (Art. 21 de la Carta de la UE) y la libre circulación de trabajadores (Reglamento UE n.º 492/2011); debe exigirse la supresión del filtro discriminatorio y acudir a los organismos de igualdad o tribunales nacionales (con apoyo de redes como SOLVIT, EURES y el control último de la Comisión Europea y el TJUE).',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Las empresas privadas de la Unión Europea pueden bloquear automáticamente candidaturas por prefijo telefónico +34 o nacionalidad española si lo ejecuta un software automático.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'El Reglamento (UE) n.º 492/2011 solo protege el desplazamiento turístico de fin de semana y no se aplica al acceso al empleo digital ni remoto.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'La única vía posible consiste en contratar a un detective privado, ya que no existen organismos de igualdad, tribunales ni redes europeas como SOLVIT o EURES.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'El rechazo sistemático de candidaturas españolas mediante filtros algorítmicos por país o prefijo +34 constituye una discriminación directa o encubierta por razón de nacionalidad prohibida por el Artículo 21 de la Carta de los Derechos Fundamentales de la Unión Europea y por el Reglamento (UE) n.º 492/2011 sobre libre circulación de trabajadores. La tecnología no exime del respeto a la igualdad de trato en el acceso al empleo. La persona afectada puede recabar asesoramiento de la Red EURES, presentar reclamación ante los organismos nacionales de igualdad o ante los tribunales nacionales del Estado miembro correspondiente (quienes pueden elevar cuestión prejudicial al Tribunal de Justicia de la UE - TJUE), utilizar la red SOLVIT si concurre una mala aplicación del Derecho de la UE por autoridades públicas, o dirigir una queja ante la Comisión Europea si existe incumplimiento estructural estatal.',
    marcoLegalReal:
      'Artículo 21 de la Carta de los Derechos Fundamentales de la Unión Europea (derecho a la igualdad y prohibición de discriminación por nacionalidad), Reglamento (UE) n.º 492/2011 relativo a la libre circulación de los trabajadores dentro de la Unión, RGPD (limitaciones y transparencia frente a decisiones automatizadas), y sistema institucional de tutela de la UE: organismos de igualdad y tribunales nacionales, Tribunal de Justicia de la Unión Europea (TJUE), Comisión Europea, Defensor del Pueblo Europeo, Red EURES y red SOLVIT.',
    activa: true,
  },
  {
    titulo:
      'Caso 09: Monitorización intrusiva en el teletrabajo y vida privada (Art. 7 Carta UE)',
    descripcion:
      'Una compañía implanta de manera oculta y sin consentimiento ni información previa un software de vigilancia extrema en los portátiles de sus empleados en teletrabajo: registra pulsaciones de teclado, toma capturas cada 15 segundos, activa la webcam en el domicilio y analiza correos privados.',
    categoria: 'privacidad',
    dificultad: 'experto',
    tiempoLimiteSegundos: 390,
    xpRecompensa: 210,
    evidencias: {
      logs: [
        '[ENDPOINT-MDM] silent_deploy=true pkg="EmployeeWatchPro" notification_to_user=false',
        '[KEYLOGGER] capture_all_windows=enabled (incluye banca personal y webmail privado)',
        '[WEBCAM-MODULE] random_snapshot_interval=180s -> upload to hr-telemetry.internal',
        '[MAIL-INSPECTOR] personal_imaps_traffic_logged=true',
      ],
      metadatos: {
        'Derecho fundamental afectado':
          'Respeto de la vida privada y familiar, del domicilio y de las comunicaciones (Art. 7 Carta UE)',
        'Garantías laborales y de datos':
          'Transparencia, proporcionalidad, minimización y prohibición de injerencia oculta (Art. 8 Carta UE, RGPD y LOPDGDD)',
        'Autoridades e instituciones':
          'AEPD y tribunales nacionales en España; Tribunal de Justicia de la UE (TJUE) y Comisión Europea en el marco del Derecho de la Unión',
      },
      extractosLegales: [
        'Carta de los Derechos Fundamentales de la Unión Europea, Artículo 7 (Respeto de la vida privada y familiar): Toda persona tiene derecho al respeto de su vida privada y familiar, de su domicilio y de sus comunicaciones.',
        'Carta de los Derechos Fundamentales de la Unión Europea, Artículo 8, RGPD y LOPDGDD española: El control empresarial del trabajo remoto exige información previa clara, finalidad legítima, idoneidad, necesidad y estricta proporcionalidad; queda prohibido acceder de forma indiscriminada a comunicaciones privadas, activar cámaras en el domicilio o instalar keyloggers ocultos.',
      ],
    },
    preguntaPrincipal:
      'A la vista de la telemetría del dispositivo, ¿cómo debe calificarse jurídicamente esta monitorización del teletrabajo y qué medidas proceden?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Es ilícita y desproporcionada: la vigilancia oculta con keylogger, activación de webcam en el domicilio e interceptación de correo personal vulnera el Artículo 7 de la Carta de los Derechos Fundamentales de la UE (vida privada y secreto de las comunicaciones) y los deberes de transparencia del Art. 8 / RGPD / LOPDGDD; debe retirarse de inmediato y puede denunciarse ante la AEPD y los tribunales.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Es plenamente legal porque el portátil pertenece a la empresa, lo que anula el respeto al domicilio y al secreto de las comunicaciones durante la jornada.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Basta con activar la webcam sin avisar y capturar contraseñas bancarias personales siempre que la empresa guarde los vídeos solo 30 días.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'El Artículo 7 de la Carta de la UE solo protege las cartas en papel y no se aplica a las comunicaciones electrónicas ni al teletrabajo.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'La instalación oculta de software que registra todas las pulsaciones (keylogger), captura la webcam dentro del domicilio e intercepta comunicaciones personales supone una injerencia grave e ilegal en el núcleo de la vida privada y el secreto de las comunicaciones protegido por el Artículo 7 de la Carta de los Derechos Fundamentales de la Unión Europea. Además, contraviene la protección de datos (Artículo 8 de la Carta, RGPD y LOPDGDD española), que exige informar previamente con total transparencia sobre cualquier mecanismo de control laboral y respetar los principios de minimización y proporcionalidad. La empresa debe desinstalar inmediatamente estas funciones intrusivas, limitar el control a métricas laborales no invasivas debidamente informadas, y los trabajadores pueden recabar tutela ante la AEPD, la Inspección de Trabajo y los tribunales nacionales (con el TJUE como intérprete supremo del Derecho de la UE).',
    marcoLegalReal:
      'Artículo 7 de la Carta de los Derechos Fundamentales de la Unión Europea (respeto de la vida privada y familiar, del domicilio y de las comunicaciones), Artículo 8 de la Carta (protección de datos personales), Reglamento General de Protección de Datos (RGPD) y Ley Orgánica de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) en España sobre intimidad ante dispositivos digitales en el ámbito laboral, bajo supervisión de la AEPD, tribunales nacionales, Comisión Europea y Tribunal de Justicia de la Unión Europea (TJUE).',
    activa: true,
  },
  {
    titulo:
      'Caso 10: Auditoría de IA en Selección de Personal (Sesgos Algorítmicos y Discriminación Indirecta)',
    descripcion:
      'Una empresa tecnológica emplea un software de cribado curricular automatizado que penaliza candidaturas con pausas laborales por cuidados familiares o con nombres femeninos para puestos de ingeniería informática (sector donde la presencia femenina en grados informáticos ronda el 17,7%).',
    categoria: 'forense',
    dificultad: 'experto',
    tiempoLimiteSegundos: 420,
    xpRecompensa: 230,
    evidencias: {
      logs: [
        '[ATS-ML-AUDIT] model="TechHireRanker-v3" feature="employment_gap_caregiving" weight=-0.42',
        '[ATS-ML-AUDIT] feature="name_gender_proxy_score" correlation_with_rejected_women=0.84',
        '[DIVERSITY-METRICS] Grados informáticos España (~17,7% mujeres) -> tasa de corte automatizado: 6,2% mujeres frente a 34,8% hombres con igual cualificación.',
        '[HR-POLICY] Sin registro de evaluación de impacto ni auditoría de criterios de selección o brecha retributiva.',
      ],
      metadatos: {
        'Hallazgo algorítmico':
          'Sesgo de género histórico entrenado en el modelo y penalización indirecta por pausas de cuidados',
        'Instrumentos de corrección':
          'Plan de Igualdad y diagnóstico de procesos (RD 901/2020) + Registro y auditoría retributiva (RD 902/2020)',
        'Vías de reclamación':
          'Inspección de Trabajo y Seguridad Social (ITSS), Instituto de las Mujeres, Instituto Andaluz de la Mujer y jurisdicción social',
      },
      extractosLegales: [
        'Ley 15/2022 integral para la igualdad de trato y la no discriminación, Artículo 9.1: Se prohíbe cualquier exclusión, restricción o criterio discriminatorio en el acceso al empleo, incluidos los criterios y procesos de selección automatizados o algorítmicos.',
        'Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres, Artículo 6: Define la discriminación indirecta por razón de sexo cuando una disposición, criterio o práctica aparentemente neutros ponen a personas de un sexo en desventaja particular respecto de personas del otro, salvo justificación objetiva y proporcionada.',
        'Real Decreto 901/2020 (planes de igualdad y su registro, incluyendo auditoría de procesos de selección y promoción) y Real Decreto 902/2020 (igualdad retributiva entre mujeres y hombres y auditoría retributiva para detectar brechas y techo de cristal), en coherencia con el Artículo 14 de la Constitución Española y la transparencia frente a decisiones automatizadas del RGPD.',
      ],
    },
    preguntaPrincipal:
      'Como auditor/a de equidad digital, ¿qué tipo de discriminación produce este algoritmo de selección y qué medidas jurídicas y técnicas son exigibles?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Constituye discriminación indirecta (Art. 6 LO 3/2007) y una exclusión ilícita en selección contraria al Art. 9.1 de la Ley 15/2022 y al Art. 14 CE; debe suspenderse el modelo sesgado, aplicarse supervisión humana y transparencia RGPD, y realizar auditorías de selección y retributivas conforme al RD 901/2020 y RD 902/2020 (denunciable ante la ITSS).',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Un algoritmo estadístico nunca discrimina legalmente porque reproduce datos históricos pasados y no aplica intención humana directa.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Penalizar las pausas por cuidados es válido conforme al RD 902/2020 siempre que se oculte en un código fuente propietario.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'Como la presencia femenina en grados informáticos ronda el 17,7%, la empresa puede descartar automáticamente al resto de candidatas sin revisión.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'El sistema automatizado incurre en discriminación indirecta por razón de sexo (Artículo 6 de la LO 3/2007) y vulnera la prohibición de exclusiones en criterios de selección del Artículo 9.1 de la Ley 15/2022 y el principio de igualdad del Artículo 14 de la Constitución Española. Penalizar pausas por cuidados o usar variables proxy vinculadas al género perpetúa la brecha digital y el techo de cristal en el sector TIC. La empresa debe retirar o reentrenar el algoritmo eliminando variables proxy y sesgos históricos, garantizar intervención humana significativa y transparencia (RGPD), auditar sus procesos de selección y promoción (RD 901/2020) y efectuar el registro y auditoría retributiva (RD 902/2020). Las personas afectadas pueden acudir a la Inspección de Trabajo y Seguridad Social (ITSS), al Instituto de las Mujeres, al Instituto Andaluz de la Mujer o a los tribunales.',
    marcoLegalReal:
      'Artículo 14 de la Constitución Española (igualdad y no discriminación), Artículo 9.1 de la Ley 15/2022 integral para la igualdad de trato y la no discriminación (criterios de selección), Artículo 6 de la Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres (discriminación indirecta por razón de sexo), Real Decreto 901/2020 (planes de igualdad y diagnóstico de procesos) y Real Decreto 902/2020 (igualdad retributiva y auditoría retributiva), además del RGPD (decisiones automatizadas) y la tutela de la Inspección de Trabajo y Seguridad Social (ITSS), el Instituto de las Mujeres y el Instituto Andaluz de la Mujer.',
    activa: true,
  },
  {
    titulo:
      'Caso 11: Ciberacoso y Vulneración de la Libertad Sexual en Entornos Digitales Corporativos',
    descripcion:
      'Un empleado crea perfiles falsos en los canales internos de mensajería corporativa para difundir mensajes degradantes de carácter sexista y comentarios intimidatorios contra una compañera, generando un entorno laboral hostil y humillante.',
    categoria: 'derecho_digital',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 185,
    evidencias: {
      logs: [
        '[SLACK-AUDIT] actor_id=usr_4092 action="create_impersonation_alias" target_user="Elena R."',
        '[CHAT-EXPORT] Mensaje difundido en #canal-proyectos: comentarios vejatorios de índole sexual y burlas reiteradas hacia la compañera.',
        '[FORENSIC-SEAL] Exportación íntegra de mensajes, metadatos de IP interna y marcas horarias firmada con SHA-256.',
      ],
      metadatos: {
        'Conducta investigada':
          'Ciberacoso, suplantación interna y hostigamiento por razón de sexo en canales digitales laborales',
        'Marco específico':
          'Ley Orgánica 10/2022 de Garantía Integral de la Libertad Sexual y Art. 7 de la LO 3/2007',
        'Canales de denuncia y apoyo':
          'Protocolo interno antiacoso, Inspección de Trabajo y Seguridad Social (Buzón ITSS), Instituto de las Mujeres e Instituto Andaluz de la Mujer',
      },
      extractosLegales: [
        'Ley Orgánica 10/2022 de Garantía Integral de la Libertad Sexual: Obliga a las empresas a promover condiciones de trabajo que eviten la comisión de delitos y otras conductas contra la libertad sexual y la integridad moral en el trabajo, incidiendo especialmente en el acoso sexual y el acoso por razón de sexo incluidos los cometidos en el ámbito digital, arbitrando procedimientos específicos de prevención y cauces de denuncia.',
        'Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres, Artículo 7: Define el acoso sexual y el acoso por razón de sexo como cualquier comportamiento realizado en función del sexo de una persona con el propósito o el efecto de atentar contra su dignidad y de crear un entorno intimidatorio, degradante u ofensivo.',
        'Ley 15/2022 y Artículo 14 de la Constitución Española; preservación de evidencias digitales corporativas con cadena de custodia y denuncia ante la Inspección de Trabajo y Seguridad Social (ITSS / Buzón ITSS) o vía penal si existen delitos contra la integridad moral, revelación de secretos o acoso.',
      ],
    },
    preguntaPrincipal:
      'Ante estas evidencias en la mensajería interna, ¿qué calificación jurídica y protocolo de actuación corresponden en la empresa y ante las autoridades?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Constituye acoso por razón de sexo / violencia digital laboral (Art. 7 LO 3/2007 y LO 10/2022); hay que preservar íntegros los logs y pruebas digitales con cadena de custodia, activar de inmediato el protocolo confidencial de prevención y protección, sancionar disciplinariamente y facilitar la denuncia ante la Inspección de Trabajo (Buzón ITSS), vía judicial/penal y organismos como el Instituto de las Mujeres o el Instituto Andaluz de la Mujer.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Borrar inmediatamente todo el historial del chat corporativo para evitar daños reputacionales y pedir a la víctima que bloquee al compañero sin abrir protocolo.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'La Ley Orgánica 10/2022 solo se aplica a agresiones físicas fuera del horario laboral y excluye los canales digitales corporativos.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'La Inspección de Trabajo y Seguridad Social (ITSS) carece de competencias sobre entornos intimidatorios o falta de protocolos frente al acoso digital.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'La difusión de mensajes sexistas degradantes y la creación de perfiles falsos para hostigar a una trabajadora en canales digitales corporativos constituyen acoso por razón de sexo y acoso en el ámbito digital tipificado en el Artículo 7 de la LO 3/2007 y cubierto por los deberes de prevención y protección de la Ley Orgánica 10/2022 de Garantía Integral de la Libertad Sexual. Nunca deben borrarse los registros: el equipo SOC/IT debe preservar los logs, marcas horarias e identificadores bajo cadena de custodia (hash SHA-256), activar el protocolo empresarial confidencial protegiendo a la víctima frente a represalias, aplicar medidas cautelares/disciplinarias e informar de los canales externos reales como el Buzón de la Inspección de Trabajo y Seguridad Social (ITSS), la denuncia policial/judicial y el asesoramiento del Instituto de las Mujeres o del Instituto Andaluz de la Mujer.',
    marcoLegalReal:
      'Ley Orgánica 10/2022 de Garantía Integral de la Libertad Sexual (prevención y protocolos frente a violencias sexuales y acoso en el ámbito laboral y digital), Artículo 7 de la Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres (acoso sexual y acoso por razón de sexo), Artículo 14 de la Constitución Española, Ley 15/2022, y canales institucionales de actuación y denuncia: Inspección de Trabajo y Seguridad Social (ITSS y Buzón ITSS), Instituto de las Mujeres, Instituto Andaluz de la Mujer y jurisdicción social o penal.',
    activa: true,
  },
  {
    titulo:
      'Caso 12: Protección de Datos y Preguntas Intrusivas en Portales de Empleo Online',
    descripcion:
      'Un portal de empleo digital obliga a las personas candidatas a subir fotografía, indicar estado civil, edad exacta y responder si planean tener hijos para poder enviar su solicitud, mostrando además bandas salariales inferiores para perfiles femeninos.',
    categoria: 'privacidad',
    dificultad: 'facil',
    tiempoLimiteSegundos: 330,
    xpRecompensa: 145,
    evidencias: {
      logs: [
        '[FORM-INSPECT] <input name="estado_civil" required="true" />',
        '[FORM-INSPECT] <input name="planes_maternidad_5_anos" type="select" required="true" />',
        '[FORM-INSPECT] <input name="fotografia_obligatoria" type="file" required="true" />',
        '[SALARY-API] puesto="Consultor/a Junior" banda_hombre="28.000 EUR" banda_mujer="23.500 EUR"',
      ],
      metadatos: {
        'Infracciones acumuladas':
          'Recogida excesiva e ilícita de datos personales + discriminación múltiple e interseccional + brecha salarial',
        'Principio RGPD vulnerado':
          'Minimización de datos y ausencia de base legítima para datos íntimos/familiares en selección',
        'Organismos competentes':
          'AEPD, Inspección de Trabajo y Seguridad Social (ITSS), Instituto de las Mujeres e Instituto Andaluz de la Mujer',
      },
      extractosLegales: [
        'Constitución Española, Artículo 14: Igualdad ante la ley y prohibición de cualquier discriminación por razón de nacimiento, sexo o cualquier otra condición o circunstancia personal o social.',
        'Ley 15/2022 integral para la igualdad de trato y la no discriminación: Prohíbe preguntas o indagaciones sobre circunstancias personales/familiares en el acceso al empleo y contempla expresamente la discriminación múltiple e interseccional (cuando concurren varias causas como sexo, edad o situación familiar).',
        'RGPD (principio de minimización de datos y licitud del tratamiento) y Real Decreto 902/2020 (igualdad retributiva: prohibición de diferenciar salarios por razón de sexo ante trabajos de igual valor), junto con la LO 3/2007.',
      ],
    },
    preguntaPrincipal:
      '¿Qué vulneraciones de protección de datos e igualdad comete este portal de empleo y qué derechos asisten a las personas candidatas?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Vulnera la minimización y licitud del RGPD al exigir fotografía, edad, estado civil y planes de maternidad sin necesidad objetiva, además de incurrir en discriminación múltiple e interseccional (Art. 14 CE y Ley 15/2022) y brecha salarial ilícita (LO 3/2007 y RD 902/2020); puede reclamarse ante la AEPD y denunciarse ante la ITSS, el Instituto de las Mujeres o el Instituto Andaluz de la Mujer.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Si el formulario tiene una casilla de "Acepto la política de privacidad", el portal puede exigir obligatoriamente planes de maternidad y fijar salarios menores por sexo.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'La discriminación múltiple e interseccional solo existe fuera de Internet y no se aplica a portales de empleo electrónicos.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'El principio de minimización de datos del RGPD obliga a recabar el máximo número de datos familiares posibles antes de la primera entrevista.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'Exigir de forma obligatoria fotografía, estado civil, edad y planes de maternidad en un registro telemático vulnera el principio de minimización de datos y licitud del RGPD (son datos irrelevantes y desproporcionados para valorar la aptitud profesional) y constituye una práctica discriminatoria contraria al Artículo 14 de la Constitución Española, a la LO 3/2007 y a la Ley 15/2022 (incluyendo supuestos de discriminación múltiple e interseccional por sexo, edad y cargas familiares). Asimismo, ofertar menor salario a mujeres por igual puesto infringe el principio de igual retribución por trabajo de igual valor (RD 902/2020). El portal debe eliminar esos campos obligatorios y corregir la escala salarial, pudiendo las personas candidatas reclamar ante la AEPD por el tratamiento ilícito de datos y acudir a la Inspección de Trabajo y Seguridad Social (ITSS), al Instituto de las Mujeres o al Instituto Andaluz de la Mujer.',
    marcoLegalReal:
      'Artículo 14 de la Constitución Española (igualdad y prohibición de discriminación), Ley 15/2022 integral para la igualdad de trato y la no discriminación (prohibición de prácticas discriminatorias en acceso al empleo y discriminación múltiple e interseccional), Ley Orgánica 3/2007, Real Decreto 902/2020 (igualdad retributiva), y Reglamento General de Protección de Datos (RGPD) y LOPDGDD sobre minimización de datos y licitud, con competencia de la AEPD, Inspección de Trabajo y Seguridad Social (ITSS), Instituto de las Mujeres e Instituto Andaluz de la Mujer.',
    activa: true,
  },
  {
    titulo:
      'Caso 13: Operación Dieselgate (Investigación de Greenwashing y Fraude de Emisiones)',
    descripcion:
      'Un consorcio automovilístico presume en sus campañas de cumplir con los objetivos climáticos del Acuerdo de París, pero una auditoría forense descubre un software oculto en las centralitas ECU que falsea las emisiones únicamente durante las pruebas oficiales de homologación.',
    categoria: 'forense',
    dificultad: 'experto',
    tiempoLimiteSegundos: 420,
    xpRecompensa: 245,
    evidencias: {
      logs: [
        '[ECU-DUMP] function detect_laboratory_dyno_cycle() { if (steering_angle == 0 && speed_profile == NEDC_WLTP) return ENGAGE_LOW_NOX_MAP; }',
        '[ROAD-TELEMETRY] Emisiones reales de NOx en carretera abierta: 9,4x por encima del límite legal declarado en ficha ecológica.',
        '[MARKETING-AUDIT] Campaña comercial "Cero Impacto París 2030" sin verificación independiente ni pruebas que respalden la afirmación ambiental.',
      ],
      metadatos: {
        'Fraude técnico detectado':
          'Dispositivo de desactivación (defeat device) en el firmware de la centralita del motor',
        'Límites planetarios afectados':
          'Transgresión de 7 de los 9 límites planetarios (act. 2025 Stockholm Resilience Centre): especialmente cambio climático, entidades nuevas (contaminación química) y acidificación oceánica',
        'Normativa europea aplicable':
          'Directiva (UE) 2024/825 sobre protección frente a afirmaciones ambientales engañosas (greenwashing) y Acuerdo de París',
      },
      extractosLegales: [
        'Directiva (UE) 2024/825 relativa al empoderamiento de los consumidores para la transición ecológica: Prohíbe las prácticas comerciales desleales basadas en afirmaciones medioambientales genéricas, infundadas o engañosas (greenwashing), exigiendo que toda alegación climática futura se sustente en compromisos claros, realistas y verificados por un experto independiente.',
        'Acuerdo de París sobre el cambio climático y marco científico de los 7 límites planetarios transgredidos (actualización 2025 del Stockholm Resilience Centre: cambio climático, integridad de la biosfera, cambio del uso del suelo, cambio del agua dulce, flujos biogeoquímicos, entidades nuevas/contaminación química y acidificación oceánica).',
        'Código Penal y normativa europea de homologación de vehículos y protección de los consumidores: Responsabilidad corporativa por fraude técnico en centralitas electrónicas y publicidad ambiental engañosa.',
      ],
    },
    preguntaPrincipal:
      'Tras analizar el volcado de la centralita ECU y la discrepancia en carretera, ¿qué infracciones técnicas y jurídicas concurren y cómo debe actuarse?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Existe fraude informático mediante dispositivo de desactivación en la ECU y greenwashing prohibido por la Directiva (UE) 2024/825, agravando la transgresión de los límites planetarios (cambio climático, entidades nuevas/contaminación química y acidificación oceánica); deben retirarse las campañas engañosas, corregir el software, indemnizar a afectados y remitir las pruebas a las autoridades nacionales y a la Comisión Europea.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Si el software supera la prueba en banco de laboratorio, la Directiva (UE) 2024/825 permite publicitar cualquier lema ecológico aunque en carretera multiplique por 9 las emisiones.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'La actualización 2025 del Stockholm Resilience Centre demuestra que ningún límite planetario ha sido superado todavía por la actividad humana.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'El código de la centralita ECU está protegido por secreto industrial absoluto, impidiendo cualquier investigación judicial o sanción por fraude ambiental.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'El volcado del firmware revela un dispositivo de desactivación ilícito que detecta el banco de homologación para reducir artificialmente los óxidos de nitrógeno (NOx) mientras emite casi diez veces más en conducción real. Esta conducta combina fraude técnico-informático con greenwashing expresamente prohibido por la Directiva (UE) 2024/825, al difundir afirmaciones climáticas falsas sin verificación independiente y contradecir los compromisos del Acuerdo de París. Ambientalmente, agrava la crisis de los 7 límites planetarios ya transgredidos según la actualización 2025 del Stockholm Resilience Centre (en especial el cambio climático, la contaminación por entidades nuevas/químicas y la acidificación oceánica). Procede preservar la imagen forense de la ECU, ordenar el cese de la publicidad engañosa, exigir la llamada a revisión y reparación sin coste, y dar traslado a las autoridades de consumo, medio ambiente, tribunales y Comisión Europea.',
    marcoLegalReal:
      'Directiva (UE) 2024/825 sobre empoderamiento de los consumidores para la transición ecológica (prohibición de afirmaciones ambientales engañosas y greenwashing), Acuerdo de París contra el cambio climático, marco científico de los 7 límites planetarios transgredidos (actualización 2025 del Stockholm Resilience Centre: cambio climático, integridad de la biosfera, cambio del uso del suelo, cambio del agua dulce, flujos biogeoquímicos, entidades nuevas y acidificación oceánica), normativa de homologación de vehículos de la UE y tutela por autoridades nacionales, tribunales y Comisión Europea.',
    activa: true,
  },
  {
    titulo:
      'Caso 14: Ciberdelitos contra la Economía Circular (Obsolescencia Programada Masiva)',
    descripcion:
      'Una multinacional tecnológica lanza actualizaciones automáticas de firmware que degradan intencionadamente el rendimiento de las baterías tras 18 meses y bloquean mediante firma criptográfica las reparaciones independientes, multiplicando los residuos electrónicos (RAEE) y agotando recursos finitos.',
    categoria: 'derecho_digital',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 195,
    evidencias: {
      logs: [
        '[NET-PCAP] GET https://ota.megatech.example/firmware/v4.9.2-force-update.bin',
        '[FIRMWARE-TRACE] if (battery_charge_cycles > 420) { cpu_max_freq = 45%; trigger_replace_prompt(); }',
        '[REPAIR-LOCK] non_oem_screen_serial_check -> DISABLE_TOUCH_AND_BIOMETRICS (impide reutilización y reacondicionamiento)',
        '[WASTE-IMPACT] +420.000 dispositivos desechados prematuramente hacia flujos lineales de RAEE no recuperados.',
      ],
      metadatos: {
        'Modelo de referencia':
          'Diagrama de Mariposa de la Fundación Ellen MacArthur (ciclo técnico: mantener, reutilizar, remanufacturar, reciclar)',
        'Impacto detectado':
          'Obsolescencia temprana por software, bloqueo de reparabilidad y presión sobre recursos finitos y límites planetarios',
        'Normativa europea':
          'Directiva (UE) 2024/825 (prohibición de prácticas de obsolescencia temprana inducida por actualizaciones) y normativa UE de ecodiseño / RAEE',
      },
      extractosLegales: [
        'Principios de Economía Circular de la Fundación Ellen MacArthur (Diagrama de Mariposa): Eliminar los residuos y la contaminación desde el diseño, mantener productos y materiales en uso durante el mayor tiempo posible (mantenimiento, reutilización, redistribución, remanufactura y reciclaje en el ciclo técnico) y regenerar los sistemas naturales.',
        'Directiva (UE) 2024/825: Califica como prácticas comerciales desleales prohibidas ocultar o presentar como necesaria una actualización de software cuando únicamente reduce la funcionalidad del bien o induce una obsolescencia temprana injustificada, así como restringir de forma engañosa la reparabilidad.',
        'Marco de Ecodiseño de la UE y gestión de Residuos de Aparatos Eléctricos y Electrónicos (RAEE), orientado a preservar recursos finitos y contener los límites planetarios transgredidos (contaminación química/entidades nuevas, uso del suelo y cambio climático).',
      ],
    },
    preguntaPrincipal:
      'Evaluando la telemetría del firmware frente al Diagrama de Mariposa y la normativa europea, ¿qué diagnóstico jurídico-ambiental es correcto?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Constituye obsolescencia temprana inducida por software y bloqueo antirreparación contrarios a la Directiva (UE) 2024/825 y al ecodiseño; rompe el ciclo técnico del Diagrama de Mariposa de la Fundación Ellen MacArthur (mantener, reutilizar, remanufacturar) generando RAEE innecesarios sobre recursos finitos, por lo que debe revertirse el firmware y habilitarse la reparabilidad.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Las actualizaciones forzadas que ralentizan equipos sin avisar forman parte de la economía circular porque obligan a comprar dispositivos nuevos cada 18 meses.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'El Diagrama de Mariposa de la Fundación Ellen MacArthur recomienda bloquear piezas de repuesto no originales para impedir la reutilización en talleres independientes.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'La Directiva (UE) 2024/825 solo regula envases de cartón y no afecta a actualizaciones de software ni a la durabilidad de dispositivos electrónicos.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'El análisis de red y firmware demuestra una práctica deliberada de obsolescencia programada mediante software: la actualización forzosa degrada el rendimiento a partir de 420 ciclos y bloquea piezas legítimas de terceros. Esto vulnera frontalmente los principios de la economía circular y el ciclo técnico del Diagrama de Mariposa de la Fundación Ellen MacArthur —que prioriza mantener, reparar, reutilizar y remanufacturar antes de reciclar para evitar residuos sobre recursos finitos— e infringe la Directiva (UE) 2024/825 sobre prácticas desleales relativas a actualizaciones de software y obsolescencia temprana, así como las exigencias europeas de ecodiseño y prevención de RAEE. La compañía debe retirar el bloqueo de reparabilidad, revertir la penalización de rendimiento e informar con transparencia sobre vida útil y piezas.',
    marcoLegalReal:
      'Directiva (UE) 2024/825 (prohibición de obsolescencia temprana inducida por software y obligaciones de información sobre durabilidad y reparabilidad), principios de economía circular del Diagrama de Mariposa de la Fundación Ellen MacArthur (eliminar residuos, mantener productos y materiales en uso, regenerar sistemas naturales), normativa de la UE sobre ecodiseño sostenible y residuos electrónicos (RAEE), y protección frente a la transgresión de los límites planetarios (actualización 2025 del Stockholm Resilience Centre).',
    activa: true,
  },
  {
    titulo:
      'Caso 15: Auditoría de Empleo Verde y Falsas Consultorías Sostenibles (Agenda 2030 y RSC)',
    descripcion:
      'Una consultora recibe fondos europeos de empleo verde alegando formar especialistas en los ODS de la Agenda 2030, pero la auditoría detecta contratos ficticios de personal, incumplimientos de transición justa e informes de huella de carbono inflados o manipulados.',
    categoria: 'derecho_digital',
    dificultad: 'medio',
    tiempoLimiteSegundos: 360,
    xpRecompensa: 190,
    evidencias: {
      logs: [
        '[CARBON-LEDGER] scope3_baseline=12.400_tCO2e -> modificado manualmente a 48.000_tCO2e para simular falsas reducciones del 74%.',
        '[AUDIT-CONTRACTS] 14 contratos etiquetados "Perito Empleo Verde ODS" corresponden a personal sin alta efectiva ni formación real en transición justa.',
        '[LABEL-CHECK] Uso de sello propio "EcoJusticia 2030 Verified" sin auditoría independiente ni acreditación oficial.',
      ],
      metadatos: {
        'Marco de referencia':
          'Agenda 2030 y Objetivos de Desarrollo Sostenible (5 pilares: Personas, Planeta, Prosperidad, Paz y Alianzas)',
        'Irregularidades':
          'Falsificación de registros de huella de carbono, sello de sostenibilidad no certificado y desvío de ayudas al empleo verde',
        'Control institucional':
          'Directiva (UE) 2024/825, autoridades nacionales de control de fondos/ITSS y supervisión de la Comisión Europea',
      },
      extractosLegales: [
        'Agenda 2030 de Naciones Unidas y sus Objetivos de Desarrollo Sostenible (ODS) articulados en 5 pilares (las 5 P): Personas, Planeta, Prosperidad, Paz y Alianzas, vinculando la transición ecológica con el empleo decente, la transición justa y la transparencia institucional.',
        'Directiva (UE) 2024/825: Prohíbe exhibir distintivos o sellos de sostenibilidad que no estén basados en un sistema de certificación independiente o establecidos por autoridades públicas, así como afirmaciones climáticas engañosas basadas en compensaciones o cálculos manipulados.',
        'Normativa española y europea de control antifraude sobre subvenciones y empleo verde, responsabilidad por falsedad documental y competencias de fiscalización de la Inspección de Trabajo, órganos de control de fondos europeos y Comisión Europea.',
      ],
    },
    preguntaPrincipal:
      'Al contrastar los contratos y la huella de carbono con los 5 pilares de la Agenda 2030 y la Directiva (UE) 2024/825, ¿qué conclusiones y medidas de fiscalización proceden?',
    opcionesTest: [
      {
        id: 'a',
        etiqueta: 'A',
        texto:
          'Concurre greenwashing mediante un sello no certificado y cálculo fraudulento de huella de carbono (prohibido por la Directiva UE 2024/825), además de desvío de fondos de empleo verde contrario a la transición justa y a los 5 pilares de la Agenda 2030 (Personas, Planeta, Prosperidad, Paz y Alianzas); debe bloquearse el sello, auditarse independientemente los datos, reintegrar las ayudas e informar a las autoridades de control, ITSS y Comisión Europea.',
        esCorrecta: true,
      },
      {
        id: 'b',
        etiqueta: 'B',
        texto:
          'Las empresas pueden diseñar libremente sus propios sellos de sostenibilidad "2030 Verified" sin auditoría externa siempre que mencionen los ODS en su web.',
        esCorrecta: false,
      },
      {
        id: 'c',
        etiqueta: 'C',
        texto:
          'Los 5 pilares de la Agenda 2030 permiten inflar artificialmente la línea base de huella de carbono si el objetivo final es mejorar la imagen de marca.',
        esCorrecta: false,
      },
      {
        id: 'd',
        etiqueta: 'D',
        texto:
          'La transición justa afecta únicamente a la contabilidad energética y no guarda relación con la veracidad de los contratos de empleo verde.',
        esCorrecta: false,
      },
    ],
    solucionReferencia:
      'La auditoría evidencia un doble fraude: ambiental y sociolaboral. Por un lado, exhibir un sello de sostenibilidad propio no respaldado por certificación independiente y alterar la línea base de huella de carbono constituye greenwashing prohibido por la Directiva (UE) 2024/825. Por otro, simular contratos de empleo verde vulnera los principios de transición justa y los 5 pilares de la Agenda 2030 (Personas, Planeta, Prosperidad, Paz y Alianzas —en concreto trabajo decente, acción climática e instituciones sólidas y transparentes—). Deben preservarse los registros contables y de huella de carbono, retirar el distintivo ilícito, exigir verificación ambiental por tercero independiente, abrir expediente de reintegro y sanción ante los órganos gestores de fondos europeos, la ITSS y la Comisión Europea.',
    marcoLegalReal:
      'Directiva (UE) 2024/825 (prohibición de distintivos de sostenibilidad sin sistema de certificación oficial o independiente y veracidad de afirmaciones ambientales), Agenda 2030 y Objetivos de Desarrollo Sostenible (ODS) sobre sus 5 pilares —Personas, Planeta, Prosperidad, Paz y Alianzas— y principios de transición justa, normativa europea y española de control y reintegro de fondos públicos, e intervención fiscalizadora de la Inspección de Trabajo (ITSS), autoridades de control y Comisión Europea.',
    activa: true,
  },
];

async function runSeed() {
  await connectDB();

  console.log('[Seed] Insertando o actualizando insignias...');
  for (const badgeData of SEED_BADGES) {
    await Badge.findOneAndUpdate(
      { codigo: badgeData.codigo },
      { $set: badgeData },
      { upsert: true, new: true }
    );
  }

  console.log(`[Seed] Insertando o actualizando las ${SEED_MISSIONS.length} misiones...`);
  for (const missionData of SEED_MISSIONS) {
    await Mission.findOneAndUpdate(
      { titulo: missionData.titulo },
      { $set: missionData },
      { upsert: true, new: true }
    );
  }

  const adminEmail = 'admin@ciberdetective.es';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      nombre: 'Director SOC',
      email: adminEmail,
      password: 'AdminSOC2026!',
      rol: 'admin',
      nivel: 4,
      xp: 1200,
      rachaDias: 5,
    });
    console.log('[Seed] Usuario administrador de prueba creado.');
  }

  const playerEmail = 'detective@ciberdetective.es';
  const existingPlayer = await User.findOne({ email: playerEmail });
  if (!existingPlayer) {
    await User.create({
      nombre: 'Agente Vega',
      email: playerEmail,
      password: 'Detective2026!',
      rol: 'user',
      nivel: 1,
      xp: 0,
      rachaDias: 1,
    });
    console.log('[Seed] Usuario detective de prueba creado.');
  }

  console.log('[Seed] Proceso de semilla completado correctamente.');
  await disconnectDB();
}

runSeed().catch(async (err) => {
  console.error('[Seed Error]', err);
  await disconnectDB();
  process.exit(1);
});
