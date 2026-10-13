# Lo que necesito de Ga

Son pocas cosas y se hacen una sola vez. Todo es gratis.

---

## 1. Encender GitHub Pages (2 minutos) — para poder abrir el juego en el celular

El juego ya se publica solo en la rama `gh-pages`, pero GitHub necesita que alguien con la cuenta del repo lo encienda una vez:

1. Entrá a: https://github.com/gaagonzaleez/Sumas-y-cuentitas/settings/pages
2. En **“Source”** elegí **“Deploy from a branch”**.
3. En **“Branch”** elegí **`gh-pages`** y al lado **`/ (root)`**. Tocá **Save**.
4. Esperá 2 minutos y abrí: **https://gaagonzaleez.github.io/Sumas-y-cuentitas/**

Si al entrar ya dice que el sitio está publicado en esa dirección, no hace falta hacer nada.

---

## 2. Nube: panel de creadora con todos los celulares, grupos y tabla de posiciones — cuenta gratuita de Supabase (10 minutos)

Sin esto el juego funciona completo, pero el **Panel de creadora** solo muestra los perfiles del celular donde lo abrís, y no hay tabla del grupo ni copia en la nube.

> Si ya hiciste este paso antes, solo repetí el paso 3 (pegar y correr `esquema.sql` otra vez): agrega lo nuevo del panel de creadora sin borrar nada.

1. Entrá a https://supabase.com y tocá **Start your project**. Creá la cuenta con tu correo de GitHub (botón “Continue with GitHub”).
2. Tocá **New project**:
   - Name: `mateaventuras`
   - Database Password: tocá **Generate a password** (no hace falta guardarla).
   - Region: **South America (São Paulo)**.
   - Plan: **Free**. Tocá **Create new project** y esperá 2 minutos.
3. En el menú de la izquierda tocá **SQL Editor** → **New query**. Abrí este archivo, copiá todo y pegalo:
   https://github.com/gaagonzaleez/Sumas-y-cuentitas/blob/main/supabase/esquema.sql
   Tocá **Run**. Tiene que decir “Success”.
4. En el menú de la izquierda: **Authentication** → **Sign In / Providers** → **Email** → apagá **“Confirm email”** → **Save**. (Así la adulta puede conectarse sin esperar un correo. Si preferís dejarlo prendido, también funciona: va a llegar un correo de confirmación.)
5. En el menú de la izquierda: **Project Settings** (ruedita) → **API**. Vas a ver dos datos:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **anon public** key (un texto largo que empieza con `eyJ...`)
6. Abrí https://github.com/gaagonzaleez/Sumas-y-cuentitas/settings/secrets/actions y tocá **New repository secret** dos veces:
   - Name: `SUPABASE_URL` → Secret: pegá el **Project URL** → **Add secret**
   - Name: `SUPABASE_ANON_KEY` → Secret: pegá la clave **anon public** → **Add secret**
7. Abrí https://github.com/gaagonzaleez/Sumas-y-cuentitas/actions/workflows/ci-despliegue.yml y tocá **Run workflow** → **Run workflow**. En unos minutos el juego ya tiene grupos.

La clave “anon public” es pública a propósito (va dentro de la app); la seguridad la dan las reglas de acceso por fila que crea el paso 3. Supabase pausa los proyectos gratis sin uso: ya hay una acción automática que lo mantiene despierto cada 3 días.

**Para ver todos los perfiles (Panel de creadora):** entrá con tu perfil **kimbo** → Ajustes → **Panel de creadora** → **Todos los celulares** → entrá con **gaagonzaleez@gmail.com** y una contraseña (la primera vez se crea la cuenta). Solo ese correo puede ver los perfiles de todos.

**Para armar un grupo:** en el juego, Ajustes → Panel de la adulta → “Grupos y copia en la nube” → Conectar → “Crear grupo”. Aparece un código tipo `LUNA-4821` para pasarle a las otras familias.

---

## Para revisar cuando puedas (no frena nada)

- **Ley 25.326 (datos personales):** el spec pide que un profesional revise las obligaciones antes de abrir el juego a más familias. El juego ya guarda lo mínimo (apodo, grado, avatar, progreso y puntos; nada de nombres reales ni fotos) y el borrado elimina todo. Con la nube activa, cada celular sube un resumen del avance (apodo, grado escolar y progreso) para el Panel de creadora; las adultas lo aceptan al crear el perfil.
- **Voces:** en `docs/voces-muestras/` quedan muestras de cada voz para escucharlas. Si alguna no te gusta, avisame cuál preferís.
