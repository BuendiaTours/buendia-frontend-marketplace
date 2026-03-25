/**
 * Utilidades para generar crops de imagen usando Canvas 2D
 */

import type { ActiveCropBox } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';

/**
 * Información de la imagen original
 */
export type ImageInfo = {
	element: HTMLImageElement;
	naturalWidth: number;
	naturalHeight: number;
};

/**
 * Transformaciones aplicadas a la imagen
 */
export type ImageTransform = {
	rotation: number; // Grados (0-360)
	scale: number; // Zoom/escala (1 = 100%) - solo para UI, no se aplica en crops finales
	flipH: boolean; // Flip horizontal
	flipV: boolean; // Flip vertical
	x: number; // Posición X en el contenedor (píxeles)
	y: number; // Posición Y en el contenedor (píxeles)
};

/**
 * Dimensiones del contenedor del editor
 */
export type ContainerDimensions = {
	width: number;
	height: number;
};

/**
 * Convierte coordenadas del contenedor a coordenadas normalizadas (0-1)
 * relativas a la imagen original
 */
export function containerToNormalized(
	containerX: number,
	containerY: number,
	containerWidth: number,
	containerHeight: number,
	imageDisplayWidth: number,
	imageDisplayHeight: number,
	imageX: number,
	imageY: number
): { x: number; y: number } {
	// Calcular posición relativa a la imagen en el contenedor
	const relativeX = containerX - (imageX + containerWidth / 2 - imageDisplayWidth / 2);
	const relativeY = containerY - (imageY + containerHeight / 2 - imageDisplayHeight / 2);

	// Normalizar (0-1)
	const normalizedX = relativeX / imageDisplayWidth;
	const normalizedY = relativeY / imageDisplayHeight;

	return { x: normalizedX, y: normalizedY };
}

/**
 * Convierte coordenadas normalizadas (0-1) a píxeles de la imagen original
 */
export function normalizedToImagePixels(
	normalizedX: number,
	normalizedY: number,
	imageNaturalWidth: number,
	imageNaturalHeight: number
): { x: number; y: number } {
	return {
		x: normalizedX * imageNaturalWidth,
		y: normalizedY * imageNaturalHeight
	};
}

/**
 * Convierte dimensiones del contenedor a dimensiones de la imagen original
 */
export function containerSizeToImageSize(
	containerWidth: number,
	containerHeight: number,
	imageDisplayWidth: number,
	imageDisplayHeight: number,
	imageNaturalWidth: number,
	imageNaturalHeight: number
): { width: number; height: number } {
	const scaleX = imageNaturalWidth / imageDisplayWidth;
	const scaleY = imageNaturalHeight / imageDisplayHeight;

	return {
		width: containerWidth * scaleX,
		height: containerHeight * scaleY
	};
}

/**
 * Crea un canvas con la imagen original y las transformaciones aplicadas
 * (rotación y flip)
 *
 * IMPORTANTE: El zoom (scale) NO se aplica aquí. El zoom es solo para UI
 * en el editor, pero los crops finales deben extraerse de la imagen original
 * a máxima resolución.
 *
 * Este canvas se usará como fuente para extraer los crops
 */
export function createTransformedCanvas(
	image: HTMLImageElement,
	transform: ImageTransform
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('No se pudo obtener contexto 2D del canvas');
	}

	// Calcular dimensiones del canvas considerando rotación
	// NO aplicamos zoom (scale) - queremos máxima resolución de la imagen original
	const rotation = (transform.rotation * Math.PI) / 180;
	const cos = Math.abs(Math.cos(rotation));
	const sin = Math.abs(Math.sin(rotation));

	const rotatedWidth = image.naturalWidth * cos + image.naturalHeight * sin;
	const rotatedHeight = image.naturalWidth * sin + image.naturalHeight * cos;

	// Dimensiones del canvas = imagen original rotada (SIN zoom)
	canvas.width = rotatedWidth;
	canvas.height = rotatedHeight;

	// Mover al centro del canvas
	ctx.translate(canvas.width / 2, canvas.height / 2);

	// Aplicar rotación
	ctx.rotate(rotation);

	// Aplicar flip (mediante scale negativo)
	ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

	// Dibujar imagen centrada a tamaño original (SIN zoom)
	ctx.drawImage(
		image,
		-image.naturalWidth / 2,
		-image.naturalHeight / 2,
		image.naturalWidth,
		image.naturalHeight
	);

	return canvas;
}

/**
 * Área del crop en coordenadas del contenedor
 */
export type CropArea = {
	x: number; // Posición X en el contenedor (píxeles)
	y: number; // Posición Y en el contenedor (píxeles)
	width: number; // Ancho en el contenedor (píxeles)
	height: number; // Alto en el contenedor (píxeles)
};

/**
 * Dimensiones finales del crop a generar
 */
export type CropDimensions = {
	width: number; // Ancho final en píxeles
	height: number; // Alto final en píxeles
};

/**
 * Genera un crop individual desde el canvas transformado
 *
 * ESTRATEGIA:
 * 1. Crear canvas con imagen rotada y con flip aplicado
 * 2. Extraer el crop del canvas rotado usando coordenadas del UI
 * 3. El canvas rotado tiene las dimensiones necesarias para contener la imagen rotada
 */
export function generateCropCanvas(
	image: HTMLImageElement,
	cropArea: CropArea,
	cropDimensions: CropDimensions,
	containerDimensions: ContainerDimensions,
	imageDisplaySize: { width: number; height: number },
	imageTransform: ImageTransform
): HTMLCanvasElement {
	// Primero crear el canvas con la imagen transformada
	const transformedCanvas = createTransformedCanvas(image, imageTransform);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('No se pudo obtener contexto 2D del canvas');
	}

	// Establecer dimensiones finales del crop
	canvas.width = cropDimensions.width;
	canvas.height = cropDimensions.height;

	// Centro del contenedor
	const containerCenterX = containerDimensions.width / 2;
	const containerCenterY = containerDimensions.height / 2;

	// Centro de la imagen en el contenedor (con zoom de UI)
	const imageCenterX = containerCenterX + imageTransform.x;
	const imageCenterY = containerCenterY + imageTransform.y;

	// Posición del crop relativa al centro de la imagen (en coordenadas de UI con zoom)
	const cropRelativeX = cropArea.x - imageCenterX;
	const cropRelativeY = cropArea.y - imageCenterY;

	// Calcular el tamaño de la imagen ROTADA en el UI
	// imageDisplaySize es el tamaño sin rotar, necesitamos calcular el tamaño rotado
	const rotation = (imageTransform.rotation * Math.PI) / 180;
	const cos = Math.abs(Math.cos(rotation));
	const sin = Math.abs(Math.sin(rotation));

	const rotatedDisplayWidth = imageDisplaySize.width * cos + imageDisplaySize.height * sin;
	const rotatedDisplayHeight = imageDisplaySize.width * sin + imageDisplaySize.height * cos;

	// Factor de escala: de coordenadas UI (rotado, con zoom) a canvas transformado (rotado, sin zoom)
	const scaleX = transformedCanvas.width / rotatedDisplayWidth;
	const scaleY = transformedCanvas.height / rotatedDisplayHeight;

	// Convertir coordenadas del crop al canvas transformado
	const sourceX = transformedCanvas.width / 2 + cropRelativeX * scaleX;
	const sourceY = transformedCanvas.height / 2 + cropRelativeY * scaleY;
	const sourceWidth = cropArea.width * scaleX;
	const sourceHeight = cropArea.height * scaleY;

	// Copiar región del canvas transformado al crop final
	ctx.drawImage(
		transformedCanvas,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		0,
		0,
		cropDimensions.width,
		cropDimensions.height
	);

	return canvas;
}

/**
 * Convierte un canvas a Base64
 *
 * @param canvas - Canvas a convertir
 * @param format - Formato de imagen ('image/jpeg' o 'image/png')
 * @param quality - Calidad para JPEG (0-1)
 * @returns String Base64 de la imagen
 */
export function canvasToBase64(
	canvas: HTMLCanvasElement,
	format: 'image/jpeg' | 'image/png' = 'image/jpeg',
	quality: number = 0.9
): string {
	return canvas.toDataURL(format, quality);
}

/**
 * Datos de un crop generado
 */
export type GeneratedCrop = {
	id: string; // ID único generado para este crop
	preset: string; // Preset que identifica el tipo de crop
	width: number; // Ancho final en píxeles
	height: number; // Alto final en píxeles
	base64?: string; // Imagen en Base64 (generada localmente)
	url?: string; // URL del servidor (cuando viene de initialState)
	format: string; // Formato de imagen ('WEBP', 'JPEG', 'PNG')
};

/**
 * Resultado de la generación de crops
 */
export type CropGenerationResult = {
	crops: GeneratedCrop[];
	totalSize: number; // Tamaño total aproximado en bytes
	timestamp: number; // Timestamp de generación
};

/**
 * Genera todos los crops a partir de la imagen y transformaciones actuales
 *
 * Esta es la función principal que orquesta todo el proceso:
 * 1. Crea canvas con imagen transformada
 * 2. Genera cada crop individual
 * 3. Convierte a Base64
 * 4. Retorna datos estructurados listos para enviar al servidor
 *
 * @param image - Elemento de imagen HTML
 * @param transform - Transformaciones aplicadas a la imagen
 * @param activeCropBoxes - Array de crop boxes activos en el editor
 * @param containerDimensions - Dimensiones del contenedor del editor
 * @param imageDisplaySize - Tamaño de la imagen mostrada en el contenedor
 * @param format - Formato de salida ('image/jpeg' o 'image/png')
 * @param quality - Calidad para JPEG (0-1)
 * @returns Resultado con todos los crops generados
 */
export function generateAllCrops(
	image: HTMLImageElement,
	transform: ImageTransform,
	activeCropBoxes: ActiveCropBox[],
	containerDimensions: ContainerDimensions,
	imageDisplaySize: { width: number; height: number },
	format: 'image/jpeg' | 'image/png' = 'image/jpeg',
	quality: number = 0.9
): CropGenerationResult {
	// Generar cada crop
	const generatedCrops: GeneratedCrop[] = [];
	let totalSize = 0;

	for (const activeCropBox of activeCropBoxes) {
		// Área del crop en el contenedor
		const cropArea: CropArea = {
			x: activeCropBox.x,
			y: activeCropBox.y,
			width: activeCropBox.width,
			height: activeCropBox.height
		};

		// Dimensiones finales del crop
		const cropDimensions: CropDimensions = {
			width: activeCropBox.crop.width,
			height: activeCropBox.crop.height
		};

		// Generar canvas del crop
		// Ahora pasamos la imagen original directamente
		const cropCanvas = generateCropCanvas(
			image,
			cropArea,
			cropDimensions,
			containerDimensions,
			imageDisplaySize,
			transform
		);

		// Convertir a Base64
		const base64 = canvasToBase64(cropCanvas, format, quality);

		// Calcular tamaño aproximado (Base64 es ~33% más grande que binario)
		const sizeBytes = Math.ceil((base64.length * 3) / 4);
		totalSize += sizeBytes;

		// Agregar a resultados
		generatedCrops.push({
			id: activeCropBox.instanceId,
			preset: activeCropBox.crop.preset,
			width: cropDimensions.width,
			height: cropDimensions.height,
			base64,
			format: activeCropBox.crop.format
		});
	}

	return {
		crops: generatedCrops,
		totalSize,
		timestamp: Date.now()
	};
}
