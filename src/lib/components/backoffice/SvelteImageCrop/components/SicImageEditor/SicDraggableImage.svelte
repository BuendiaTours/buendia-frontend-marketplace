<script lang="ts">
	let {
		src,
		initialX = 0,
		initialY = 0,
		rotation = 0,
		zoom = 1,
		flipH = false,
		flipV = false,
		enableDrag = true,
		imageElement = $bindable(undefined),
		onPositionChange
	}: {
		src: string;
		initialX?: number;
		initialY?: number;
		rotation?: number;
		zoom?: number;
		flipH?: boolean;
		flipV?: boolean;
		enableDrag?: boolean;
		imageElement?: HTMLImageElement | undefined;
		onPositionChange?: (data: { x: number; y: number }) => void;
	} = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived -- mutated imperatively during drag
	let x = $state(0);
	// eslint-disable-next-line svelte/prefer-writable-derived -- mutated imperatively during drag
	let y = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);
	let startY = $state(0);
	let startImageX = $state(0);
	let startImageY = $state(0);

	$effect(() => {
		x = initialX;
	});

	$effect(() => {
		y = initialY;
	});

	function onMouseDown(event: MouseEvent): void {
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		startImageX = x;
		startImageY = y;
		event.preventDefault();
	}

	function onMouseMove(event: MouseEvent): void {
		if (!isDragging) return;

		const deltaX = event.clientX - startX;
		const deltaY = event.clientY - startY;

		x = startImageX + deltaX;
		y = startImageY + deltaY;

		// Call position change callback in real-time during drag
		onPositionChange?.({ x, y });
	}

	function onMouseUp(): void {
		if (isDragging) {
			isDragging = false;
		}
	}

	function onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
		}
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	role="button"
	tabindex="0"
	class="sic-draggable-image absolute top-0 left-0 h-full w-full outline-none select-none"
	class:cursor-grab={enableDrag && !isDragging}
	class:cursor-grabbing={enableDrag && isDragging}
	style="
    transform: translate({x}px, {y}px) rotate({rotation}deg) scale({zoom}) scaleX({flipH
		? -1
		: 1}) scaleY({flipV ? -1 : 1});
  "
	onmousedown={enableDrag ? onMouseDown : undefined}
	onkeydown={onKeyDown}
>
	<img
		bind:this={imageElement}
		{src}
		alt="Editable"
		draggable="false"
		crossorigin="anonymous"
		class="pointer-events-none h-full w-full object-contain"
		style="-webkit-user-drag: none;"
	/>
</div>
