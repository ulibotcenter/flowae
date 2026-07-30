# Auth temporalmente desactivada (acceso abierto)

## Desactivar login (demo del despacho en Vercel)

En el proyecto de Vercel (o entorno de despliegue), define:

```bash
VITE_AUTH_ENABLED=false
```

**Importante:** es variable de Vite → hay que **Rebuild / Redeploy** para que el cliente la lea.

Efecto:

- No se muestra la pantalla de login ni OAuth (evita “Invalid origin”).
- Todos los visitantes usan el usuario compartido `dev-user` con rol **Administración**.
- Panel, Hoy, facturas y configuración se ven con permisos de admin.
- Badge “Acceso abierto” en la interfaz.
- El código de Better Auth / login **no se borra**; solo se desactiva.

## Reactivar autenticación real

1. En Vercel, **elimina** `VITE_AUTH_ENABLED` o pon:

   ```bash
   VITE_AUTH_ENABLED=true
   ```

2. Redesplega la aplicación.

3. Configura orígenes OAuth / Better Auth (`BETTER_AUTH_URL`, broker Grok, etc.) para el dominio `https://flowae.vercel.app`.

Tras reactivar, cada usuario vuelve a iniciar sesión con su cuenta y los roles (Admin / Abogado) se aplican con normalidad.
