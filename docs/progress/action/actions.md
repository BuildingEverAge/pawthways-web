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