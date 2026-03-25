<script lang="ts">
	type Props = {
		title?: string;
		subTitle?: string;
		wrapperClass?: string;
	};

	let { title: _title, subTitle: _subTitle, wrapperClass }: Props = $props();
</script>

<div
	class="c-newsletter-registration relative h-[196px] overflow-hidden rounded-xl sm:h-[314px] {wrapperClass}"
>
	<img src="" class="h-full w-full object-cover object-center" />
	<div class="bg-alpha-ink-48 absolute inset-0"></div>
</div>
