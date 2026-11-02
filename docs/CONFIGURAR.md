# Cómo poner la página en marcha

La página funciona sin configurar nada: en ese caso el progreso se guarda **solo en el dispositivo**
y no aparece el botón "Ingresar". Para activar las cuentas (mail + contraseña) y la sincronización
hace falta un proyecto de Supabase (el plan gratuito alcanza).

## 1. Crear el proyecto de Supabase

1. Entrá a <https://supabase.com>, creá una cuenta y un proyecto nuevo (región São Paulo, la más cercana).
2. En **SQL Editor → New query**, pegá todo el contenido de [`supabase/schema.sql`](../supabase/schema.sql) y tocá **Run**.
   Crea las tablas `perfiles`, `materias_estado` y `electivas` con sus políticas de seguridad (RLS):
   cada usuario solo puede ver y modificar lo suyo, salvo que active su perfil público.
3. En **Authentication → URL Configuration**:
   - **Site URL**: la dirección donde va a estar la página, por ejemplo `https://enigma0121v.github.io/progreso-de-carrera/`
   - **Redirect URLs**: agregá esa misma dirección y `http://localhost:5173/` (para probar en tu compu).
4. (Opcional) En **Authentication → Sign In / Providers → Email** podés desactivar *Confirm email* si no querés
   que los usuarios tengan que confirmar el mail al registrarse. El servicio de mail gratuito de Supabase
   manda pocos mails por hora; para uso real conviene configurar un SMTP propio (Authentication → Emails → SMTP).
5. En **Project Settings → API** copiá la **Project URL** y la clave **anon public**.
   ⚠️ Nunca uses ni compartas la clave `service_role`.

## 2. Probar en tu compu

```bash
npm install
```

```bash
cp .env.example .env.local
```

Completá `.env.local` con la URL y la clave anon, y después:

```bash
npm run dev
```

Abrí <http://localhost:5173>.

## 3. Publicar en GitHub Pages

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. En **Settings → Secrets and variables → Actions → pestaña Variables**, creá dos variables de repositorio:
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Cada push a `main` corre los tests, arma la página y la publica (workflow `.github/workflows/deploy.yml`).
   También se puede lanzar a mano desde la pestaña **Actions**.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local con recarga automática |
| `npm test` | Tests de la lógica de correlativas, promedio y horas |
| `npm run validar` | Revisa los datos de las carreras (referencias, ciclos, niveles, horas) |
| `npm run build` | Valida los datos, chequea tipos y genera `dist/` |
