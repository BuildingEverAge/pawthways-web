

✅ MASTER CHECKLIST — TRANSPARENCY COMMITMENT (FINAL & COMPLETA)
La versión que controla TODO lo necesario para dar por TERMINADA la página.

1️⃣ Estructura & Contenido HTML (debe estar al 100%)
1. Hero
Título: "Our Transparency Commitment"


Subtexto claro sobre el 40% reservado para rescates


Imagen hero funcionando


Badge “40% → Donated”


CTA primario → /transparency-dashboard.html


CTA secundario → mailto:contact.pawthways@gmail.com


Meta <title> + <meta description>


JSON-LD: WebPage + Organization


2. What this commitment means
Bullets:


40% of revenue is reserved


Public proofs (PDF receipts, transfers)


Public data always verifiable


3. 4-Step Verification Process
(Obligatorio según plan maestro)
Step 1: Check /api/admin-stats


Step 2: Review proofs (PDFs)


Step 3: Cross-verify with CSV (if available)


Step 4: Validate timestamps → receipts


Timeline visual en HTML/CSS (simple)


4. What we publish
Monthly aggregates


Receipts / Proof PDFs


CSV downloads


Beneficiaries list


Audit reports (if available)


5. How to verify (human + technical)
Instrucciones humanas claras


Comandos curl reales:

 curl -s https://pawthways-web.vercel.app/api/admin-stats | jq .
curl -s "https://pawthways-web.vercel.app/api/transparency-proofs?limit=3" | jq .


Enlace a dashboard


Enlace a CSV (si existe)


6. Latest Proofs (API integration)
Grid de 3–6 pruebas máximas


Thumbnails funcionando


Abrir PDF en nueva pestaña


Alt text descriptivo


Fallback si falla imagen o API


7. Philosophy / Why we donate
3 bullets claros


Statement corto final


8. FAQ (mínimo 3)
Refunds


Rejected NGO


How to request a report


9. Footer
Terms


Privacy


Legal placeholder with <!-- TODO: legal pages -->



2️⃣ CSS (coherencia total con el proyecto)
Must-have
Usar sólo transparency-commitment.css final


Variables :root iguales a how-revenue-works


Soporte Dark / Light theme 100%


Spacing, grid, typography consistente


Estilos .tp-* sin colisiones


Responsive
Hero reflow correcto <900px


Proofs → 2 o 3 columnas


Timeline apila correctamente


Footer en columnas en móvil



3️⃣ JavaScript (DEBE cumplir todo esto)
Admin-stats
Tolerancia a alias:


total_sales | totalRevenue


total_reserved | total_donated


FallBack si endpoint falla


Renderiza:


Total revenue


Reserved


Pending


Donation %


Last updated


Proofs
Usa los alias:


doc_url | pdf_url | url


thumbnail_url | thumb_url


Inserta thumbnails dinámicamente


Compatible con proof-fallback.js


Fallback amigable si no hay pruebas


Theme toggle
Compatible con IDs existentes


localStorage persiste tema


Sin romper CSS o Chart


Charts
No doble-init


Si Chart.js no está → NO rompe


Si existe → update, no recreate


Performance
Timeout en fetch (4.5s)


Sin errores JS en consola


Page loads even if APIs fail



4️⃣ SEO + Accesibilidad
SEO
<title> correcto


<meta name="description">


<link rel="canonical">


JSON-LD válido


Accesibilidad
Alt en todas las imágenes


aria-label en CTAs


Tab order correcto


Contrastes AA


Tooltips accesibles



5️⃣ Seguridad & Legal
Legal (muy importante)
PDFs revisados: sin PII


needs-legal-review agregado en HTML o PR


Comprobantes reales corresponden a montos públicos


Seguridad
Content-Type: application/pdf para proofs


Nada en JS expone emails privados


Fallbacks activos si API falla



6️⃣ QA — Checklist final antes de merge (obligatoria)
(Tomada de tu documento de QA interno)
cURL tests
[ ]

 curl -s https://pawthways-web.vercel.app/api/admin-stats | jq .
 → Devuelve generated_at, total_reserved, pending


[ ]

 curl -s "https://pawthways-web.vercel.app/api/transparency-proofs?limit=3" | jq .
 → Array válido con URLs reales


Screenshots
Desktop 1366×768


Mobile 390×844


Functional
Abrir PDF → correcto y seguro


Thumbnails → no rompen si fallan


Fallbacks muestran texto amable


A11y / SEO
Lighthouse a11y > 90


SEO básico correcto


Staging tests
Carga sin errores JS


API responde en staging


CTAs funcionan



7️⃣ Criteria for DONE — condición para cerrar 2.2
De acuerdo a tu documento interno (AA — cosas hechas & plan) :
La página se considera HECHA cuando:
Todas las secciones HTML están completas


Todos los datos se cargan desde APIs reales


Fallbacks funcionan


Copy 100% en inglés


Legal revisó la parte de PII


QA pasó (curl + pruebas visuales)


Founder (tú) aprueba el copy y estructura


La página está deployada sin errores




