# Crucigramas temáticos

Generador web en español con palabras obtenidas mediante IA y un motor local que construye una cuadrícula densa de estilo prensa.

## Funciones

- Tema libre y dificultad configurable.
- Cuadrículas de 15×15 y 20×20.
- Nueva combinación cada vez, con reducción de repeticiones dentro de la sesión.
- Todas las palabras quedan conectadas; se descartan casillas blancas inútiles y grandes manchas negras.
- Definiciones horizontales y verticales, solución interactiva e impresión en PDF A4 apaisado.
- Diseño adaptable a ordenador, Mac, iPad y móvil.
- La clave de OpenAI se guarda exclusivamente como variable del servidor.

## Ejecutar en local

1. Instala Node.js 20 o posterior.
2. Copia `.env.example` como `.env` e introduce `OPENAI_API_KEY`.
3. Ejecuta:

```bash
npm install
npm run dev
```

Abre la dirección que muestre Netlify Dev.

## Pruebas

```bash
npm test
```

## Publicar

Importa este repositorio en Netlify, configura `OPENAI_API_KEY` en **Environment variables** y despliega. No escribas nunca la clave en `public/app.js` ni en ningún archivo enviado a GitHub.

## Nota sobre PDF editable

La cuadrícula se rellena directamente en el navegador. Para conservar las respuestas, imprime como PDF desde el navegador después de rellenarla. La solución puede mostrarse u ocultarse antes de imprimir.

## Licencia

MIT.
