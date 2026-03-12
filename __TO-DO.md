# Componente de galería con thumbnails cuadrados configubales:

Necesito hacer un componente reutilizable llamado `GallerySquareThumbs.svelte` en `src/lib/components/marketplace`, y hoja de estilos (si fuese necesaria) `.c-gallery-square-thumbs` en: `src/lib/styles/marketplace/components`

La base de lo que necesito es exactamente lo que tenemos en:
@src/routes/(marketplace)/components/BndLightbox/+page.svelte#270-285

El componente debe mostrar una serie de miniaturas en formato cuadrado, organizadas en un grid horizontal.

Al pulsar sobre las imágenes debe abrirse nuestro lightbox y posicionarse el la imagen / review correspondiente.

Otros casos que debería soportar:

- Que las imágenes sean de la categoría `Fotos de actividad`
- Que se pueda limitar el número de imágenes que se muestra en el componente (aunque el lightbox debe mostrarlas todas)
