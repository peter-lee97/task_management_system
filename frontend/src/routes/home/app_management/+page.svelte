<script lang="ts">
	import { validateAccount } from '$lib/authStore';
	import { onMount } from 'svelte';

	onMount(() => {
		validateAccount();
	});
</script>

<h1>WIP: App Management</h1>
