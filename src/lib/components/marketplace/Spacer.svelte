<script lang="ts">
	type Props = {
		wrapperClass?: string;
		margin?: string;
		lineColor?: string;
	};

	let {
		wrapperClass = '',
		margin = 'my-6',
		lineColor = 'border-[var(--color-border-default)]'
	}: Props = $props();
</script>

<div class="c-spacer border-b {margin} {lineColor} {wrapperClass}"></div>
