# Auth temporalmente desactivada (acceso abierto)

## Estado actual

En el código, `TEMPORARY_OPEN_ACCESS = true` en:

`src/lib/auth/open-access.ts`

Con eso la app **no** muestra `/login` ni llama a Better Auth / OAuth.
Todos entran al panel como **Administración** (`dev-user`).

Así se evita el error **Invalid origin** en `https://flowae.vercel.app` mientras se configura el broker OAuth.

## Comportamiento

| Qué | Con acceso abierto |
|-----|--------------------|
| `/login` | Redirige al panel |
| Rutas protegidas | Entran con admin compartido |
| Demo | Redirige al panel sin Better Auth |
| Badge UI | “Acceso abierto” |

## Cómo reactivar la autenticación real

1. En `src/lib/auth/open-access.ts` pon:
   ```ts
   export const TEMPORARY_OPEN_ACCESS = false;
   ```
2. En Vercel (opcional pero recomendado):
   - `VITE_AUTH_ENABLED=true`  
   - o elimina `VITE_AUTH_ENABLED=false` si la tenías
3. Redesplega.
4. Configura orígenes OAuth / `BETTER_AUTH_URL` para `https://flowae.vercel.app`.

## Solo con variable de entorno (sin tocar el flag)

Si `TEMPORARY_OPEN_ACCESS = false`:

- `VITE_AUTH_ENABLED=false` → auth off (requiere **rebuild**)
- sin variable o `true` → auth on

## Importante

- El código de Better Auth **no se borra**.
- En acceso abierto todos los visitantes comparten el mismo admin: no usar en producción real con datos sensibles.
- Hace falta `DATABASE_URL` en Vercel (Postgres/Neon).
