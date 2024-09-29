<script>
	import { page } from '$app/stores';
	import NavBar from '$components/NavBar.svelte';

	$: {
		currentPath = $page.url.pathname;
		console.log('current path: ', currentPath);
	}
	let currentPath = '';
</script>

{#if currentPath == '/home/app_management' || currentPath == '/home/user_management'}
	<NavBar />
{/if}
<slot />
