# Agenda Virtual de la UTN (FRH) — brief del proyecto

Proyecto de Luis Mamani (estudiante de ingeniería, UTN Facultad Regional Haedo).
Idioma de la interfaz y de la comunicación: español rioplatense (voseo).

## Qué es
Web de seguimiento de carrera para las 6 ingenierías de la UTN FRH. Hay una versión
existente (hecha con la plataforma Enter, parece usar Supabase):
https://3409ed84a14c4feeb639af29fe003ec4.prod.enter.pro
Título: "Agenda Virtual de la UTN". Es un proyecto independiente, sin vínculo oficial con la UTN.

## Cómo es la página actual (ver capturas en `referencia/`)
- Tema oscuro, tipografía sans bold, acentos en azul. Cada carrera tiene un color propio.
- Portada: título, botones "Agenda" y "Plan de Estudio", datos: 6 ingenierías, 256 materias
  organizadas por correlativas.
- Plan de Estudio: tarjetas de las 6 carreras (Aeroespacial 51 materias, Bioingeniería 40,
  Electrónica 38, Ferroviaria 45, Industrial 42, Mecánica 40). Todas Plan 2023.
- Vista de carrera: columnas por año (Año 1..5), tarjeta por materia con checkbox, etiqueta de año,
  botón "Ver correlativas", ícono de info. Materias integradoras marcadas con "INTEGRADORA".
- Panel de progreso: aprobadas / total, porcentaje, barra, leyenda Aprobada (verde) /
  Disponible (amarillo) / Bloqueada (gris), botón "Reiniciar".
- Las materias bloqueadas muestran candado; tocarlas muestra qué correlativas faltan.
- Hoy el progreso se guarda solo en el dispositivo. También existe la sección "Agenda" (eventos).

## Cambios pedidos
1. **Registro e inicio de sesión de usuarios** (mail + contraseña). El avance se guarda en la cuenta
   y se sincroniza entre dispositivos (reemplaza el guardado local).
2. **Dos condiciones distintas por materia**: *regularizada* y *aprobada* (más el estado pendiente).
   Esto cambia la lógica de desbloqueo: en la UTN, para cursar suele pedirse correlativa
   regularizada o aprobada, y para rendir el final suele pedirse aprobada. Cada materia debe
   distinguir "puede cursar" de "puede rendir final". Verificar con las ordenanzas oficiales
   y con los archivos de `planes-de-estudio/`.
3. **Nota por materia aprobada** y **promedio** calculado, visible junto al panel de progreso.
   - La nota es **personal y privada por defecto**. Cada usuario puede elegir mostrarla (perfil público opcional).
   - Futuro (no implementar ahora, pero diseñar la base de datos para que sea posible):
     **competencias entre grupos** dentro de la página, con perfiles de alumnos, donde los grupos
     compiten por promedio/nota. Requiere opt-in explícito, grupos y rankings.
4. **Horas de materias electivas**: contador de horas electivas cursadas/aprobadas del usuario,
   con el total requerido por el plan de cada carrera, visible en el panel de progreso.
   Tomar los requisitos de horas electivas de los archivos de `planes-de-estudio/`.

## Decisiones tomadas con Luis
- "Horas de correlativas" estaba mal dicho: se refiere a **horas de materias electivas** (punto 4).
- Privacidad de notas: personal por defecto, compartir es opcional; competencias a futuro.

- Código: se rehízo desde cero (no se usa el export de Enter). Stack: Vite + React + TypeScript + Tailwind,
  Supabase para cuentas y datos (Luis crea el proyecto; ver `docs/CONFIGURAR.md`), deploy a GitHub Pages.
- Regla de correlativas: para cursar, columna "Cursada" regular o aprobada y columna "Aprobada" aprobada;
  para rendir el final, todas aprobadas. Proyecto Final: todo el plan aprobado + horas electivas.
- La sección "Agenda" (eventos) queda para más adelante; el botón aparece como "pronto".
- Popover de correlativas como el original (lista con ✓/candado, año y "Faltan N correlativas"),
  pero separado en "Para cursar" y "Para rendir el final".

## Estructura del código
- `src/data/carreras/*.json`: materias, correlativas, horas, integradoras y electivas de cada carrera.
  Dudas de transcripción en `docs/DUDAS-DATOS.md`. Validar con `npm run validar`.
- `src/lib/logica.ts`: reglas de cursar/rendir, situación de cada materia, promedio y horas (con tests).
- `src/lib/almacen.ts`: guardado en Supabase (con sesión) o en localStorage (sin sesión).
- `supabase/schema.sql`: tablas + RLS. Preparado para competencias entre grupos (opt-in `participa_competencias`).

## Datos de materias
Los archivos de los planes de estudio y sus correlativas van en `planes-de-estudio/`
(los sube Luis). Las 256 materias con correlativas son la parte más laboriosa: no inventar datos,
tomarlos de esos archivos y marcar cualquier duda.

## Notas para Claude Code
- Recomendado: Supabase para auth y base de datos (el original ya lo usa), con políticas RLS
  para que cada usuario vea solo su progreso.
- Mantener el diseño oscuro y la estructura por columnas de año.
- Dejar claro en el pie que los datos son orientativos y no oficiales.
