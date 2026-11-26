# Notas de enseñanza — Foldkit

## Preferencias del usuario
- **Idioma**: español. Mantener nombres de API y términos técnicos en inglés (Model, Message, update, Command, Schema, Effect) tal como aparecen en la doc oficial.
- **Estilo**: teoría primero — entender el modelo mental antes de escribir código. Balancear con micro-ejercicios de tracing y quizzes para no perder la práctica de retrieval.
- **Background**: bases de React y TypeScript. Entiende "de qué va" la Elm Architecture y Effect conceptualmente, pero sin experiencia práctica en ninguno de los dos.

## Decisiones didácticas
- Anclar cada concepto nuevo a su equivalente React (useState→Model, useReducer→update, useEffect→Command/Subscription). La doc oficial tiene una página dedicada a esto (Coming from React) que sirve de guía.
- El usuario quiere construir un frontend para un backend Effect: cuando se cubran Commands HTTP, orientar los ejercicios a consumir una API, no a lógica de UI pura.
- Foldkit v0.171.0, pre-1.0, Effect ~4.1.0, Node 22+. Si algo de la API difiere de lo documentado, verificar contra GitHub antes de enseñarlo.

## Pendientes
- Lección 0002 candidata: Commands con Effect en profundidad (HTTP, args, fail como Message).
- Lección 0003 candidata: Subscriptions y el tiempo (auto-count), o testing con Story/Scene.
- En algún punto: que el usuario corra `npx create-foldkit-app@latest` y explore DevTools (fue marcado como opcional en la lección 0001).
- Preguntar si ya tiene el backend Effect corriendo o está en diseño, para orientar el ejercicio final del curso.
