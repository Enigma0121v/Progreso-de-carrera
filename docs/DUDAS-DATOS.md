# Dudas y decisiones sobre los datos

Los datos de `src/data/carreras/*.json` se transcribieron a mano desde los PDF de `planes-de-estudio/`.
Las celdas dudosas se verificaron con la posición del texto en el PDF (`pdftotext -bbox`).
Los totales de horas cierran exacto con cada plan: suma de materias + electivas + PPS = duración en h reloj.

`npm run validar` revisa referencias inexistentes, ciclos y correlativas de niveles posteriores.

## Generales (para confirmar con Luis)

1. **Regla para rendir el final**: las ordenanzas dan una sola regla, "Para cursar y rendir: Cursada / Aprobada".
   Se interpretó (confirmado): para **cursar**, las de "Cursada" regulares o aprobadas y las de "Aprobada" aprobadas;
   para **rendir el final**, todas aprobadas. Proyecto Final: para rendir, todas las asignaturas del plan aprobadas
   y las horas de electivas completas.
2. **Electivas no se cuentan como materia**: van al contador de horas. Por eso algunas carreras muestran una
   materia menos que la página original (Aeroespacial 50 en vez de 51, Electrónica 37 en vez de 38).
3. **La PPS no se cuenta como materia**: se muestra su requisito debajo del plan.
4. **Duración**: Aeroespacial, Electrónica y Ferroviaria tienen 6º nivel (5 ½ años, según cada plan); la página
   original mostraba "5 años" para Aeroespacial.
5. **Nota**: entera de 1 a 10. El promedio usa solo materias y electivas aprobadas que tengan nota cargada (sin aplazos).

## Por carrera

### Aeroespacial (Ord. 1926 / 1927)
- Nº 3 Diseño y Representación Aeroespacial pide la Nº 2 cursada aunque ambas son de 1er nivel (verificado en el PDF).
- Integradoras (según "Área: Integradora" de los programas): 1, 10, 20, 28, 43, 50.

### Bioingeniería (Ord. 1944 / CSU 2131)
- Se usa la numeración de la **modificación CSU 2131**, que reordena 1er y 2do nivel respecto del plan original:
  Química General pasa a ser la Nº 8 (1er nivel) y Análisis de Señales y Sistemas la Nº 9 (2do nivel).
  Las horas se tomaron del plan original buscando cada materia por nombre.
- La ordenanza pide la misma correlativa como cursada **y** aprobada en dos casos (12 Redes y Electrotecnia → Física I;
  26 Sistemas de Control Básicos → Redes y Electrotecnia). Rige la condición más exigente (aprobada).
- Integradoras: Talleres de Práctica Profesional I y II ("proyectos integradores" del plan) y Proyecto Final. **Confirmar.**

### Electrónica (Ord. 1849 / Res. CD FRH 324/2023)
- Niveles según la **distribución de la FRH** (Res. 324/2023), que difiere de la Ord. 1849.
- No hay ordenanza de correlativas de Rectorado en el repo: se usa la tabla de la Res. 324/2023.
- **Integradoras: el plan no las identifica.** La página original marcaba Medidas Electrónicas (II) como integradora.
  Quedó sin marcar hasta confirmar.
- La Res. 324 lista dos electivas de oferta FRH con correlativas (Introducción al Análisis de Señales y Sistemas,
  Marketing). Aparecen como sugerencias en la sección de electivas.

### Ferroviaria (Ord. 1928 / 1929)
- Proyecto Final: la lista para cursar no incluye la Nº 42 (Instrumentos y Mediciones). Se copió tal cual.
- Proyecto Final figura con 6 hs cát. semanales y 72 h reloj en el plan. Se copió tal cual.

### Industrial (Ord. 1908 / 1909)
- Legislación (35) figura sin horas cátedra semanales, con 48 h reloj.
- Electivas (240 h) sin nivel asignado en el plan.

### Mecánica (Ord. 1901 / 1902)
- Sin dudas.
