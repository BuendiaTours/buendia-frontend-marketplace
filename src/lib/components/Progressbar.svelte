<script lang="ts">
	type Props = {
		fgColor?: string;
		bgColor?: string;
		percentage?: string;
		wrapperClass?: string;
	};

	let {
		fgColor = 'bg-success-700',
		bgColor = 'bg-neutral-100',
		percentage = '0',
		wrapperClass = ''
	}: Props = $props();
</script>

<div class="flex h-2 rounded-full {bgColor} {wrapperClass}">
	<div class="rounded-full {fgColor}" style="width: {percentage}%;"></div>
</div>
