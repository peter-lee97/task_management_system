<script lang="ts">
	import { authStore, validateAccount } from '$lib/authStore';
	import { onMount } from 'svelte';
	import NavBar from '../../components/NavBar.svelte';

	onMount(async () => {
		await validateAccount();
	});

	$: account = $authStore;
</script>

<NavBar />
<h1>WIP: App Management</h1>
