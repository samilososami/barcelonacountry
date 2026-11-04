export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  links?: { label: string; href: string }[];
};

export type LegalDocument = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export type LegalDocumentKey = "privacidad" | "aviso-legal" | "cookies";

const contact = { label: "privacidad@barcelonacountry.com", href: "mailto:privacidad@barcelonacountry.com" };
const websites = "https://bcncountryfest.com/ y https://barcelonacountry.com/";
const controller = [
  "Responsable: Events Mayaan SL.",
  "NIF: B93978757.",
  "Domicilio social: Ronda Maiols, 1, Edificio BMC, 08172 - Sant Quirze del Vallès.",
  "Correo electrónico de contacto en materia de privacidad: privacidad@barcelonacountry.com.",
  `Sitios web: ${websites}`
];

// Base: textos facilitados por Javier el 02/11/2026. Cambios y fuentes en
// docs/proveedores-y-privacidad.md. Revisar antes de añadir servicios o datos.
export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
  privacidad: {
    title: "Política de Privacidad",
    updatedAt: "2026-11-04",
    sections: [
      {
        id: "responsable", title: "1. Responsable del tratamiento",
        paragraphs: ["Esta política informa sobre el tratamiento de los datos de las personas interesadas en Barcelona Country Fest y de quienes se suscriben a Barcelona Country News."],
        items: controller, links: [contact]
      },
      {
        id: "datos", title: "2. ¿Qué datos personales recogemos?",
        paragraphs: [
          "A través del formulario de registro de personas interesadas en Barcelona Country Fest, podemos recoger los datos que se indican a continuación.",
          "También conservamos información relacionada con el registro y la suscripción, como la fecha de alta, el idioma del formulario, la constancia de aceptación de la política de privacidad y el estado del consentimiento para recibir la newsletter. Cuando se habiliten los envíos, podrá registrarse su estado.",
          "Los proveedores técnicos pueden tratar datos de conexión, como la dirección IP y la información del navegador, para servir y proteger la web. Si nos escribes, trataremos el contenido de tu consulta y los datos que nos facilites. No incluyas datos sensibles ni datos de otras personas en los campos de texto.",
          "Solicitamos únicamente los datos necesarios para las finalidades descritas en esta Política de Privacidad."
        ],
        items: [
          "Nombre y apellidos.",
          "Dirección de correo electrónico.",
          "Número de teléfono, incluido su prefijo.",
          "País asociado al prefijo telefónico seleccionado. No es una geolocalización ni acredita tu nacionalidad o residencia.",
          "Lugar o lugares donde sueles bailar, que indiques en el formulario.",
          "Tu elección, independiente y opcional, de suscribirte a la newsletter."
        ]
      },
      {
        id: "finalidades", title: "3. ¿Para qué utilizamos tus datos?",
        paragraphs: [
          "a) Gestionar tu registro como persona interesada en Barcelona Country Fest. Utilizaremos los datos facilitados para gestionar tu inscripción en nuestra base de personas interesadas y atender las solicitudes relacionadas con el festival. El país asociado al prefijo permite organizar los contactos; el dato sobre dónde sueles bailar permite conocer los lugares y comunidades de baile de las personas interesadas en el evento.",
          "b) Enviar la newsletter y comunicaciones informativas y promocionales. Cuando hayas prestado tu consentimiento, utilizaremos tu dirección de correo electrónico para enviarte novedades sobre Barcelona Country Fest, información sobre artistas, actuaciones, actividades, programación, entradas, promociones y futuras ediciones del festival. Podrás retirar tu consentimiento en cualquier momento mediante el enlace de baja incluido en cada comunicación o escribiendo al correo de privacidad.",
          "c) Gestionar consultas y solicitudes. Si nos contactas, podremos utilizar tus datos para responder a tus preguntas y atender las gestiones que nos hayas solicitado.",
          "d) Cumplir las obligaciones legales aplicables. En aquellos casos en los que resulte necesario, trataremos los datos para cumplir las obligaciones legales que correspondan al Responsable.",
          "No utilizaremos los datos para finalidades incompatibles con las aquí descritas sin facilitar previamente la información correspondiente y, cuando sea necesario, solicitar el consentimiento adecuado."
        ]
      },
      {
        id: "bases-juridicas", title: "4. ¿Cuál es la base jurídica del tratamiento?",
        paragraphs: [
          "El tratamiento de los datos se realizará sobre las siguientes bases jurídicas, según la finalidad correspondiente.",
          "El consentimiento para recibir la newsletter es independiente del resto de finalidades. La casilla de newsletter es opcional y no está marcada de antemano. No marcarla no impide enviar el formulario de registro. La aceptación del tratamiento necesario para gestionar el registro se solicita por separado, junto al enlace a esta política."
        ],
        items: [
          "Gestión del registro y de la solicitud de información: las medidas solicitadas por la persona interesada y, cuando corresponda, su consentimiento para gestionar el alta en la base de interesados.",
          "Envío de la newsletter y comunicaciones comerciales por correo electrónico: el consentimiento libre, específico, informado e inequívoco de la persona interesada.",
          "Atención de consultas: la gestión de la solicitud recibida y, cuando corresponda, el interés legítimo en atender las comunicaciones dirigidas al Responsable.",
          "Cumplimiento de obligaciones legales: el cumplimiento de las obligaciones legales aplicables."
        ]
      },
      {
        id: "conservacion", title: "5. ¿Durante cuánto tiempo conservaremos tus datos?",
        paragraphs: [
          "Los datos se conservarán durante el tiempo necesario para cumplir las finalidades para las que fueron recogidos y, cuando corresponda, durante los plazos exigidos por la legislación aplicable.",
          "Cuando los datos dejen de ser necesarios, serán suprimidos o, si procede, bloqueados durante los plazos legalmente establecidos.",
          "La retirada del consentimiento para recibir la newsletter no implica necesariamente la eliminación inmediata de toda evidencia de la suscripción o de su baja, cuando sea necesario conservarla para acreditar el cumplimiento legal."
        ],
        items: [
          "Base de personas interesadas: mientras sea necesario gestionar la solicitud y mantener la relación informativa solicitada, de acuerdo con los criterios de conservación establecidos por el Responsable.",
          "Newsletter: mientras mantengas tu suscripción y no retires el consentimiento.",
          "Prueba del consentimiento y de la baja: durante el tiempo necesario para acreditar el cumplimiento de las obligaciones legales y atender posibles reclamaciones.",
          "Consultas: durante el tiempo necesario para resolverlas y realizar las actuaciones posteriores que correspondan."
        ]
      },
      {
        id: "proveedores", title: "6. ¿Quién puede recibir tus datos?",
        paragraphs: [
          "Los datos personales podrán ser tratados por proveedores que presten servicios al Responsable y que necesiten acceder a ellos para desarrollar sus funciones. Estos proveedores actuarán bajo las instrucciones del Responsable cuando tengan la condición de encargados del tratamiento y deberán ofrecer las garantías exigidas por la normativa de protección de datos.",
          "No venderemos tus datos personales a terceros. Tampoco cederemos tus datos a patrocinadores, colaboradores u otras empresas para que te envíen sus propias comunicaciones comerciales, salvo que exista una base jurídica válida para hacerlo y se te haya informado adecuadamente. Cuando sea necesario, solicitaremos un consentimiento específico e independiente.",
          "Los datos podrán comunicarse a las autoridades u organismos públicos cuando exista una obligación legal que así lo requiera.",
          "Estos son los servicios de la web y el uso previsto para cada uno. Activar un mapa externo no comparte con Google los datos que hayas escrito en nuestro formulario."
        ],
        items: [
          "Vercel: alojamiento y distribución de la web y ejecución de la API que recibe el formulario. Trata las solicitudes de conexión y los datos que envías a través de esa API para prestar el servicio.",
          "Supabase: almacenamiento de los registros, gestión de acceso del personal administrador y alojamiento de los archivos publicados en el blog. La base de datos del proyecto está configurada en la región eu-west-3, París. El listado de personas inscritas no es público.",
          "Arsys Internet S.L.U.: gestión de dominios y DNS y servicio del buzón privacidad@barcelonacountry.com. Cuando escribes a ese buzón, el servicio de correo trata el mensaje y sus datos asociados.",
          "Google Maps: mapa externo de la ubicación del festival, solo si autorizas su carga. Google recibe datos de conexión y del navegador y puede utilizar sus propias cookies conforme a tus ajustes. Puedes rechazarlo y seguir utilizando el resto de la web.",
          "Resend (Plus Five Five, Inc.): proveedor preparado para el futuro envío de newsletters. El envío automático de bienvenida está pendiente de activación. Cuando se habilite, se utilizarán el nombre, el correo de quienes hayan consentido y el contenido del mensaje; no se necesita enviar el teléfono ni el lugar donde bailas."
        ],
        links: [
          { label: "Información de privacidad de Vercel", href: "https://vercel.com/legal/privacy-notice" },
          { label: "Información legal y de privacidad de Supabase", href: "https://supabase.com/legal" },
          { label: "Información legal de Arsys", href: "https://www.arsys.es/legal/politica-de-privacidad" },
          { label: "Política de Privacidad de Google", href: "https://policies.google.com/privacy?hl=es" },
          { label: "Información de privacidad de Resend", href: "https://resend.com/legal/privacy-policy" }
        ]
      },
      {
        id: "transferencias", title: "7. ¿Se realizarán transferencias internacionales de datos?",
        paragraphs: [
          "Algunos proveedores operan internacionalmente. La ubicación europea de la base de datos no implica que todos los servicios, accesos de soporte o redes de distribución de contenido se limiten al Espacio Económico Europeo (EEE).",
          "Vercel utiliza infraestructura distribuida y contempla tratamiento en Estados Unidos y otros países. Supabase Pte. Ltd. está establecida en Singapur y cuenta con una filial de soporte y operaciones en Estados Unidos; su documentación distingue el alojamiento regional de la base de datos de los accesos de soporte y la distribución global de archivos. Google también puede tratar datos fuera del EEE al utilizar el mapa autorizado. Resend prevé tratamiento principal en Estados Unidos cuando se active el servicio de envío.",
          "Para las transferencias que lo requieran, deberán aplicarse los mecanismos previstos por la normativa, como decisiones de adecuación o cláusulas contractuales tipo. La documentación pública de los proveedores describe sus marcos y garantías: Supabase y Resend incluyen cláusulas contractuales tipo en sus acuerdos de tratamiento; Vercel y Google publican información sobre los mecanismos de transferencia que utilizan.",
          "Puedes solicitar al Responsable más información sobre las garantías aplicables a tus datos y una copia de las que corresponda facilitar, a través de privacidad@barcelonacountry.com. La incorporación o sustitución de servicios se reflejará en esta política cuando afecte al tratamiento de tus datos."
        ],
        links: [
          { label: "Vercel: transferencias de información", href: "https://vercel.com/legal/privacy-notice" },
          { label: "Supabase: residencia y transferencias", href: "https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq" },
          { label: "Supabase: acuerdo de tratamiento", href: "https://supabase.com/legal/customer-resources/data-processing-addendum" },
          { label: "Google: marcos de transferencia de datos", href: "https://policies.google.com/privacy/frameworks?hl=es" },
          { label: "Resend: acuerdo de tratamiento", href: "https://resend.com/legal/dpa" },
          contact
        ]
      },
      {
        id: "derechos", title: "8. ¿Qué derechos tienes?",
        paragraphs: [
          "Puedes ejercer los derechos indicados a continuación en relación con tus datos personales. Para ello, envía tu solicitud a privacidad@barcelonacountry.com.",
          "En la solicitud, indica el derecho que deseas ejercer y facilita la información necesaria para que podamos identificar tu solicitud. Si existen dudas razonables sobre tu identidad, podremos solicitar información adicional proporcionada y necesaria para verificarla.",
          "La retirada del consentimiento para recibir la newsletter también puede realizarse mediante el enlace de baja incluido en los correos electrónicos."
        ],
        items: [
          "Acceso: conocer si tratamos tus datos y obtener información sobre ese tratamiento.",
          "Rectificación: solicitar la corrección de datos inexactos o incompletos.",
          "Supresión: solicitar la eliminación de tus datos cuando proceda legalmente.",
          "Oposición: oponerte a determinados tratamientos en los supuestos previstos por la normativa.",
          "Limitación del tratamiento: solicitar que restrinjamos el tratamiento en las circunstancias legalmente establecidas.",
          "Portabilidad: recibir los datos que hayas facilitado en un formato estructurado, de uso común y lectura mecánica, cuando se cumplan los requisitos legales.",
          "Retirada del consentimiento: retirar en cualquier momento el consentimiento que hayas otorgado, sin que ello afecte a la licitud del tratamiento realizado antes de su retirada."
        ], links: [contact]
      },
      {
        id: "reclamaciones", title: "9. ¿Puedes presentar una reclamación?",
        paragraphs: [
          "Si consideras que el tratamiento de tus datos personales no se ajusta a la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), especialmente si consideras que no hemos atendido correctamente el ejercicio de tus derechos.",
          "Puedes consultar la información y los procedimientos disponibles en la web oficial de la Agencia Española de Protección de Datos."
        ], links: [{ label: "Agencia Española de Protección de Datos", href: "https://www.aepd.es/" }]
      },
      {
        id: "seguridad", title: "10. Seguridad de los datos",
        paragraphs: [
          "El Responsable adoptará las medidas técnicas y organizativas apropiadas para proteger los datos personales frente al acceso no autorizado, la pérdida, la alteración, la divulgación o cualquier otra forma de tratamiento ilícito, teniendo en cuenta la naturaleza de los datos, los riesgos y las circunstancias del tratamiento.",
          "El acceso a los datos estará limitado a las personas y proveedores que lo necesiten para desarrollar las funciones que tengan encomendadas."
        ]
      },
      {
        id: "menores", title: "11. Datos de menores",
        paragraphs: [
          "El formulario de personas interesadas está dirigido a personas que puedan facilitar válidamente sus datos personales conforme a la legislación aplicable.",
          "Si se prevé captar datos de menores, el Responsable deberá revisar las condiciones del formulario y aplicar las garantías que correspondan según la edad de las personas interesadas y la normativa vigente."
        ]
      },
      {
        id: "modificaciones", title: "12. Modificaciones de esta Política de Privacidad",
        paragraphs: [
          "El Responsable podrá actualizar esta Política de Privacidad para reflejar cambios legales, organizativos o tecnológicos, o modificaciones en las finalidades y condiciones del tratamiento.",
          "La versión vigente estará disponible en la web oficial de Barcelona Country Fest e indicará su fecha de actualización.",
          "Si se introduce un nuevo tratamiento que requiera información adicional o un nuevo consentimiento, se adoptarán las medidas necesarias antes de llevarlo a cabo.",
          "Responsable del tratamiento: Events Mayaan SL. Correo electrónico de contacto: privacidad@barcelonacountry.com."
        ], links: [contact]
      }
    ]
  },
  "aviso-legal": {
    title: "Aviso legal", updatedAt: "2026-11-04",
    sections: [
      {
        id: "identificacion", title: "1. Datos identificativos",
        paragraphs: [
          "En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos del titular de este sitio web:",
          "Datos registrales: Inscrita en el Registro Mercantil de Barcelona, Sección 8.ª, Hoja B-663513, Inscripción 1.ª."
        ], items: [...controller, "Nombre comercial: Barcelona Country Fest."], links: [contact]
      },
      {
        id: "condiciones", title: "2. Objeto y condiciones de uso",
        paragraphs: [
          "El presente Aviso Legal regula el acceso, navegación y utilización del sitio web de Barcelona Country Fest.",
          "El acceso a la web atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en este Aviso Legal.",
          "El usuario se compromete a utilizar el sitio web de forma lícita, responsable y conforme a la legislación vigente, absteniéndose de realizar actividades que puedan perjudicar los derechos o intereses de Events Mayaan SL o de terceros, o que puedan dañar, inutilizar o sobrecargar el funcionamiento de la web."
        ]
      },
      {
        id: "propiedad", title: "3. Propiedad intelectual e industrial",
        paragraphs: [
          "Todos los contenidos de este sitio web, incluyendo textos, imágenes, fotografías, diseños, logotipos, marcas, elementos gráficos y demás materiales, están protegidos por la normativa de propiedad intelectual e industrial.",
          "Salvo autorización expresa de su titular o cuando la legislación lo permita, queda prohibida su reproducción, distribución, transformación, comunicación pública o cualquier otra forma de utilización sin autorización previa.",
          "Los derechos sobre los contenidos pertenecen a Events Mayaan SL o a sus respectivos titulares."
        ]
      },
      {
        id: "festival", title: "4. Información sobre Barcelona Country Fest",
        paragraphs: [
          "La web ofrece información sobre Barcelona Country Fest, sus actividades, programación, artistas, novedades y demás contenidos relacionados con el festival.",
          "Events Mayaan SL podrá actualizar o modificar, total o parcialmente, la información publicada, incluyendo fechas, horarios, actividades, artistas y programación, cuando resulte necesario por motivos organizativos o de otra naturaleza.",
          "La organización procurará mantener la información actualizada y comunicar los cambios relevantes a través de los canales oficiales del festival."
        ]
      },
      {
        id: "responsabilidad", title: "5. Responsabilidad",
        paragraphs: [
          "Events Mayaan SL no garantiza la disponibilidad permanente ni la ausencia de errores en el funcionamiento del sitio web, aunque adoptará las medidas razonables para procurar su correcto funcionamiento y seguridad.",
          "La empresa no será responsable de los daños derivados de interrupciones, incidencias técnicas, virus u otros elementos ajenos a su control, en los términos permitidos por la legislación vigente.",
          "Tampoco será responsable del contenido, funcionamiento o políticas de privacidad de páginas web de terceros a las que puedan dirigirse enlaces desde este sitio web.",
          "Nada de lo dispuesto en este apartado limitará las responsabilidades que legalmente no puedan excluirse."
        ]
      },
      {
        id: "enlaces", title: "6. Enlaces a terceros",
        paragraphs: [
          "Este sitio web puede contener enlaces a páginas o plataformas externas con el objetivo de facilitar información adicional al usuario.",
          "Events Mayaan SL no controla ni asume responsabilidad sobre los contenidos, servicios o políticas de dichos sitios externos. El acceso a ellos se realizará bajo la responsabilidad del usuario y conforme a sus propias condiciones de uso."
        ]
      },
      {
        id: "datos", title: "7. Protección de datos personales",
        paragraphs: [
          "El tratamiento de los datos personales facilitados a través de este sitio web se realizará conforme a la normativa vigente en materia de protección de datos.",
          "Para conocer las finalidades del tratamiento, su base jurídica, los posibles destinatarios y cómo ejercer los derechos reconocidos por la normativa, el usuario puede consultar nuestra Política de Privacidad."
        ], links: [{ label: "Política de Privacidad", href: "/privacidad" }]
      },
      {
        id: "cookies", title: "8. Política de Cookies",
        paragraphs: [
          "Este sitio web utiliza almacenamiento local para recordar elecciones del usuario y permite cargar servicios externos opcionales, como Google Maps, únicamente después de autorizarlos.",
          "El usuario puede consultar información detallada sobre estas tecnologías, sus finalidades y la forma de gestionarlas en nuestra Política de Cookies."
        ], links: [{ label: "Política de cookies", href: "/cookies" }]
      },
      {
        id: "modificaciones", title: "9. Modificaciones",
        paragraphs: [
          "Events Mayaan SL se reserva el derecho a modificar el presente Aviso Legal para adaptarlo a cambios legislativos, técnicos o de funcionamiento del sitio web.",
          "Las modificaciones serán publicadas en esta misma página y entrarán en vigor desde el momento de su publicación."
        ]
      },
      {
        id: "legislacion", title: "10. Legislación aplicable y jurisdicción",
        paragraphs: [
          "El presente Aviso Legal se regirá por la legislación española.",
          "Para la resolución de cualquier controversia relacionada con el uso de este sitio web, las partes se someterán a los juzgados y tribunales que correspondan conforme a la legislación aplicable.",
          "Cuando el usuario tenga la condición de consumidor o usuario, se respetarán las normas imperativas que le resulten aplicables en materia de competencia judicial y protección de consumidores."
        ]
      },
      {
        id: "contacto", title: "11. Contacto",
        paragraphs: [
          "Para cualquier consulta relacionada con este Aviso Legal o con el funcionamiento del sitio web, puedes contactar con Events Mayaan SL — Barcelona Country Fest.",
          "Correo electrónico: privacidad@barcelonacountry.com.",
          `Web: ${websites}`
        ], links: [contact]
      }
    ]
  },
  cookies: {
    title: "Política de cookies", updatedAt: "2026-11-04",
    sections: [
      {
        id: "responsable", title: "1. Responsable del sitio web",
        paragraphs: [`El responsable de los sitios web ${websites} es Events Mayaan SL.`],
        items: controller, links: [contact]
      },
      {
        id: "que-son", title: "2. ¿Qué son las cookies?",
        paragraphs: [
          "Las cookies son pequeños archivos que se almacenan en el dispositivo del usuario cuando visita una página web. Permiten recordar información sobre su navegación, facilitar el funcionamiento del sitio y mejorar la experiencia de uso.",
          "Esta política también informa sobre tecnologías similares, como localStorage, que conserva información en tu navegador. El almacenamiento local no es una cookie: no se envía automáticamente con cada petición HTTP."
        ]
      },
      {
        id: "inventario", title: "3. ¿Qué tecnologías utilizamos?",
        paragraphs: [
          "La web no incorpora herramientas propias de analítica ni publicidad. Las fuentes tipográficas y las fotografías de fondo se sirven desde la propia web. El servicio externo opcional es Google Maps, descrito en el apartado siguiente.",
          "El almacenamiento necesario para recordar tus elecciones o mantener una sesión de administración solicitada no activa Google Maps ni implica consentimiento para la newsletter."
        ],
        items: [
          "bcf-cookie-consent — almacenamiento local propio. Guarda la aceptación o el rechazo de Google Maps y la fecha de esa decisión. Se vuelve a solicitar al caducar a los 180 días, al cambiar la versión de las preferencias o al borrar los datos del navegador. Es necesario para respetar tu elección, incluida la de rechazar.",
          "barcelona-country-language — almacenamiento local propio. Recuerda el idioma que eliges expresamente. Permanece hasta que lo cambies o elimines los datos del sitio en el navegador; no realiza seguimiento entre páginas web.",
          "Sesión de Supabase Auth — almacenamiento local utilizado al acceder al panel de administración, con claves de sesión de Supabase. Conserva los tokens necesarios para esa sesión. Se elimina al cerrar sesión o borrar los datos del sitio; la validez de las credenciales también depende de su expiración y revocación. No necesitas iniciar sesión para enviar el formulario público."
        ]
      },
      {
        id: "terceros", title: "4. Google Maps y tecnologías de terceros",
        paragraphs: [
          "Google Maps permite consultar la ubicación del festival. El mapa integrado no se carga hasta que aceptas los servicios externos o activas Google Maps en las preferencias. Si lo rechazas, puedes consultar la dirección sin cargar el mapa.",
          "Al autorizarlo, tu navegador contacta con Google, que recibe datos como la IP y la información del navegador y puede leer o guardar cookies. Su comportamiento depende de tu sesión de Google, de tus ajustes y de las restricciones del navegador. Google describe usos de funcionalidad, seguridad, preferencias, medición y publicidad en su propia documentación; esta web no incorpora Google Analytics ni campañas publicitarias mediante el mapa.",
          "Como ejemplos de su catálogo oficial, Google describe NID (preferencias y otros usos, con caducidad de 6 meses desde el último uso) y _Secure-ENID (preferencias, hasta 13 meses). Son ejemplos de cookies que Google declara, no una afirmación de que todas se instalen en cada visita a nuestro mapa. La relación efectiva puede variar; consulta la información de Google y las cookies del dominio google.com que muestre tu navegador.",
          "Los enlaces que abren Google Maps u otras páginas externas llevan a servicios independientes, con sus propias políticas. No se cargan por el mero hecho de que el enlace aparezca en nuestra web."
        ], links: [
          { label: "Google: cookies, finalidades y duración", href: "https://policies.google.com/technologies/cookies?hl=es" },
          { label: "Política de Privacidad de Google", href: "https://policies.google.com/privacy?hl=es" }
        ]
      },
      {
        id: "preferencias", title: "5. Gestión del consentimiento",
        paragraphs: [
          "Al acceder a la web, puedes aceptar, rechazar o configurar los servicios externos que no sean estrictamente necesarios. El rechazo permite seguir navegando y enviar el formulario. Cerrar el panel sin guardar no equivale a aceptar.",
          "Puedes modificar o retirar tu elección en cualquier momento mediante «Preferencias de cookies». Al desactivar Google Maps se retira el mapa integrado y se impide su carga mientras mantengas el rechazo.",
          "La retirada evita nuevas cargas del mapa desde esta web, pero no puede deshacer datos ya comunicados a Google ni borrar desde aquí las cookies de su dominio. Para eliminarlas, utiliza los ajustes de tu navegador.",
          "La elección se recuerda por navegador y por dominio. Si visitas ambos dominios del festival, utilizas otro dispositivo o borras los datos de navegación, puede ser necesario elegir de nuevo. Si el navegador impide guardar la preferencia, solo podrá mantenerse durante la visita actual."
        ]
      },
      {
        id: "eliminar", title: "6. Cómo eliminar o bloquear las cookies",
        paragraphs: [
          "Puedes permitir, bloquear o eliminar las cookies y el almacenamiento local desde la configuración de privacidad de tu navegador. Revisa los datos del dominio del festival y, si has utilizado el mapa, los de Google.",
          "La desactivación de determinadas tecnologías necesarias podría afectar al funcionamiento de algunas funcionalidades, como recordar el idioma o mantener una sesión de administración. Borrar las preferencias no implica aceptar los servicios externos: el mapa volverá a quedar bloqueado hasta que lo autorices."
        ], links: [{ label: "Google: gestionar las cookies en el navegador", href: "https://policies.google.com/technologies/cookies?hl=es" }]
      },
      {
        id: "datos", title: "7. Protección de datos personales",
        paragraphs: [
          "Cuando el uso de cookies implique el tratamiento de datos personales, este se realizará conforme a la normativa vigente en materia de protección de datos.",
          "Para obtener más información sobre el tratamiento de datos personales, los proveedores, las transferencias internacionales y el ejercicio de derechos, puedes consultar nuestra Política de Privacidad."
        ], links: [{ label: "Política de Privacidad", href: "/privacidad" }]
      },
      {
        id: "modificaciones", title: "8. Modificaciones de la política",
        paragraphs: [
          "Events Mayaan SL podrá actualizar esta Política de Cookies cuando se produzcan cambios en las tecnologías utilizadas, en los servicios integrados en la web o en la normativa aplicable.",
          "Antes de incorporar servicios que requieran consentimiento, se actualizará la información y, cuando corresponda, se solicitará una nueva elección.",
          "Para cualquier consulta relacionada con esta política, puedes contactar con nosotros a través de privacidad@barcelonacountry.com."
        ], links: [contact]
      }
    ]
  }
};
