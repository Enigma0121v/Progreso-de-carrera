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
4. **Horas** (a definir, ver pendientes): mostrar horas en el plan / progreso.

## Pendientes de definir con Luis
- "Horas de correlativas": ¿carga horaria de cada materia, total de horas acumuladas de la carrera,
  o horas de las materias previas necesarias para cursar otra?
- Nota: ¿la ve solo cada usuario o hay algo compartido entre compañeros (ranking)?
- ¿Se puede exportar el código original de Enter (GitHub/carpeta)? Si sí, partir de ahí;
  si no, reconstruir desde capturas + datos de los planes.

## Datos de materias
Los archivos de los planes de estudio y sus correlativas van en `planes-de-estudio/`
(los sube Luis). Las 256 materias con correlativas son la parte más laboriosa: no inventar datos,
tomarlos de esos archivos y marcar cualquier duda.

## Notas para Claude Code
- Recomendado: Supabase para auth y base de datos (el original ya lo usa), con políticas RLS
  para que cada usuario vea solo su progreso.
- Mantener el diseño oscuro y la estructura por columnas de año.
- Dejar claro en el pie que los datos son orientativos y no oficiales.
