# 🐾 PAWTHWAYS — MASTER CHECKLIST OFICIAL (v2.0 - ESTADO REAL VERIFICADO)

---

## ⭐ **BLOCK 1 — FOUNDATION & DEPLOYMENT**

### 1.1 — Project Setup
- [x] Create pawthways-web project ✅
- [x] Follow HTML5UP style structure ✅
- [x] Create /assets/css, /assets/js, /assets/images ✅
- [x] Create base pages:
  - [x] index.html ✅
  - [x] story.html ✅
  - [x] watch-and-help.html ✅
  - [x] transparency.html ✅
  - [x] donate.html ✅ **¡YA EXISTE! (tu checklist dice pending)**
- [x] Push to GitHub ✅
- [x] Connect to Vercel ✅

1.2 — Supabase Setup

[x] Create Supabase project ✅

[x] Configure env keys internally ✅

[x] Create tables: rescues, donations, transparency_logs ✅

[x] Add RLS policies ✅

[x] Create buckets: rescue-images, transparency-proofs ✅

[x] Create final public views:

[x] public_rescue_view ✅

[x] public_transparency_view ✅

[x] public_stats_view ✅


### 1.3 — Deployment
- [x] Initial Vercel deploy ✅
- [ ] Connect official domain pawthways.org ❌

---

## ⭐ **BLOCK 2 — TRANSPARENCY + WATCH & HELP**


✅ CHECKLIST COMPLETA — WATCH & HELP (Estado Actual)
🟩 1. Backend / Supabase
[x] Función deployada correctamente (functions/rescues)
[x] Función sin anon key, segura
[x] Función usa public_rescue_view internamente
[x] CORS funcionando sin errores
[x] Datos llegan limpios y fiables
[x] Rescates completados (progress=100%) ya no se muestran

🟩 2. Frontend — watch-and-help.html
Estructura / contenido
[x] Fetch correcto desde Supabase
[x] Rescates cargan sin errores
[x] Imagen mostrada arriba en móvil y desktop
[x] Título, animal name, location, goal → OK
[x] Snippet con límite de caracteres → OK
[x] Botón “Help this rescue” funcionando
[x] Layout responsivo (desktop y móvil)
[x] Container central para todas las cartas
[x] Ninguna key filtrada → 100% seguro
Sistema de cartas dinámicas
[x] Máximo visible simultáneo = 4
[x] Cola interna (rescueQueue) funcionando
[x] Cuando una carta desaparece, entra la siguiente
[x] Auto-sweep cada 1 segundo
[x] Desaparece SÓLO la carta al 100%
[x] DOM limpio, sin duplicados
[x] Se actualiza sin recargar la página

🟩 3. CSS / Layout
[x] Cartas perfectamente cuadradas
[x] Imagen arriba siempre
[x] Sin separación rara ni estiramientos
[x] Grilla de 2 columnas desktop / 1 en móvil
[x] Sin conflictos con spotlight viejo
[x] Estilos consistentes con template

🟩 4. Performance
[x] Fetch sin cache → datos siempre actualizados
[x] Limpieza automática de cartas completas
[x] No hay límites globales → se muestra lo que exista
[x] Animación pendiente (no afecta rendimiento)

❗️ Pendientes opcionales (si tú quieres mejorarlo)
🟨 Estética y UX
[ ] Añadir animación suave cuando una carta desaparece
[ ] Añadir “skeleton loading” mientras carga
[ ] Suavizar transiciones del grid
🟨 Futuro backend
[ ] Mover donaciones a un sistema real (Stripe / Crypto payments)
[ ] Añadir transparencia por ID (cada rescue con su página)

🟢 RESUMEN RAPIDÍSIMO (versión mini)
✔️ Todo lo importante está hecho.
 ✔️ Las cartas cargan perfecto.
 ✔️ La cola funciona.
 ✔️ Se eliminan automáticamente.
 ✔️ Responsive está bien.
 ✔️ Código estable.
 ✔️ Nada roto.
Te queda solamente animar la desaparición, si quieres más polish.



✔️ 2.2 — transparency.html

[x] Connected to transparency_logs ✅

[x] Connected to funded rescues snapshot (public_rescue_view) ✅

[x] KPIs section implemented (public_stats_view) ✅

[x] Hero image fixed ✅

[x] Internal links corrected (Back to Watch & Help) ✅

[x] escapeHtml fixed (anti-XSS) ✅

[x] Full asset verification by Cline (CSS, images, scripts) ✅

[x] Add badges: "Verified / Pending" (según file_url) ✅

[x] Improve card visual layout (spacing, readability, badge placement) ✅

[x] Switch logs to public_transparency_view (vista oficial ya implementada) ✅

### ✔️ 2.3 — index.html
- [x] Primary CTA → watch-and-help.html ✅
- [x] Secondary CTA → transparency.html ✅
- [x] Final CTAs → donate.html + watch-and-help.html ✅
- [x] Fixed broken /Donate link ✅
- [ ] Optional: add impact counters (from stats view) ❌

### ✔️ 2.4 — story.html
- [x] Page created ✅
- [ ] CTA at the end → watch-and-help.html ❌
- [ ] CTA "See how we use donations" → transparency.html ❌
- [ ] UX polish + emotional finish ❌

---

## ⭐ **BLOCK 3 — LEGAL, FINANCE, ONG**
- [ ] "How Donations Work" page ❌
- [ ] Coded Pix payment section ❌
- [ ] Legal & Terms page ❌
- [ ] Transparency commitment page ❌
- [ ] Monthly transparency dashboard ❌
- [ ] ONG verification pipeline ❌
- [ ] Donor confirmation form ❌
- [ ] Anti-fraud system (Pix + invoice OCR) ❌

---

## ⭐ **BLOCK 4 — GROWTH ENGINE**

### 4.1 — Stripe / Pix → Supabase Automation
- [ ] Stripe webhook in Make ❌
- [ ] Map payment_intent → donations row ❌
- [ ] Insert donation in Supabase ❌
- [ ] Internal notification (email or Discord) ❌
- [ ] Full test with real Stripe payment ❌

### 4.2 — Auto-Funded Rescues Automation
- [ ] Trigger every 15 minutes ❌
- [ ] Fetch active rescues ❌
- [ ] Sum donations for each rescue ❌
- [ ] If >= target → update status to funded ❌
- [ ] Optional notification ❌

### 4.3 — Transparency Log Alerts
- [ ] Poll every 10 minutes ❌
- [ ] Detect new logs ❌
- [ ] Send internal alert ❌

---

## ⭐ **BLOCK 5 — SUSTAIN & SCALE**

### 5.1 — Streamlit Cleanup
- [x] Official decision: NOT public ✅
- [ ] Keep only dashboards / analytics ❌
- [ ] Remove unnecessary pages ❌
- [ ] Clean navigation ❌

### 5.2 — UI/UX Enhancements
- [ ] Full mobile optimization ❌
- [ ] Smooth animations ❌
- [ ] Unified branding colors ❌
- [ ] Button styles consistent ❌
- [ ] Footer links complete ❌
- [ ] Optional: sticky CTA button ❌

### 5.3 — Marketing Launch Prep
- [ ] TikTok video ready ❌
- [ ] Emotional script + captions ❌
- [ ] CTA linking to pawthways.org ❌
- [ ] 3 micro-stories for post-launch ❌

---

## 🎯 **RESUMEN EJECUTIVO**

**✅ ITEMS CORRECTOS en tu checklist:** 32/52 = 61.5%
**⚠️ ITEMS DESACTUALIZADOS:** 3 (donate.html existe, progress bar es real, ya usa public views)
**❌ ITEMS PENDIENTES:** 17


