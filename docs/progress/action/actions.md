2025-12-03 — Resolución del 404 / Cómo se intentó servir how-revenue-works.html
Acciones completadas

Se verificó que how-revenue-works.html existía localmente.

Se verificó que el archivo estaba correctamente en Git.

Se verificó que el archivo estaba presente en origin/main.

Se movió el archivo desde la raíz a la carpeta public/.

Se realizó commit del movimiento del archivo.

Se ejecutó git push origin main para desplegar los cambios.

Se forzó un redeploy en Vercel mediante un commit vacío.

Se instaló y utilizó Vercel CLI en la máquina local.

Se listaron los deployments con vercel list.

Se intentó obtener logs de Vercel con vercel logs (runtime logs).

Se confirmó que los logs runtime no mostraban errores relevantes.

Se comprobó que el archivo seguía generando error 404 desde Vercel.

Se creó un backup local mediante git stash push -u -m "backup: before fixing vercel.json routing".

Se reemplazó vercel.json por la configuración mínima:

{ "version": 2, "cleanUrls": true, "trailingSlash": false }


Se ejecutó git add vercel.json, commit y push con el mensaje de corrección de rutas.

Se añadió un comentario a public/how-revenue-works.html para forzar detección en el build.

Se realizó commit y push del cambio para el redeploy forzado.

Tras el redeploy, se verificó nuevamente la ruta pública y se observó que el 404 persistía.



2025-12-03 — Fix: Restoring Supabase + Vercel API Functionality

Brief description:
Se restauró completamente el funcionamiento del endpoint /api/admin-stats en producción. Se corrigió el problema de lectura desde Supabase, se implementó un handler estable, se añadió logging detallado, se solucionaron problemas de claves y permisos, y se verificó que la API responde correctamente con datos reales.

Executed steps:

Se reescribió api/admin-stats.js con manejo robusto de errores y prioridad explícita de claves (SERVICE_ROLE → ADMIN_TOKEN → ANON).

Se añadió logging estructurado para detectar errores reales de Supabase en Vercel.

Se desplegó la nueva versión a Vercel en producción.

Se verificó la lectura correcta de tablas sales y donations usando la SERVICE_ROLE key.

Se ejecutó prueba directa del endpoint confirmando valores reales (2017 ventas, 806.8 reservados, 0 pendientes).

Se confirmó en logs que no existen errores (has_sales_error = false, has_donations_error = false).

Se validó que el CORE del sistema queda completamente funcional y estable.