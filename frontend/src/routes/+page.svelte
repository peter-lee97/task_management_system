<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, validateAccount } from '$lib/authStore';
	import { browser } from '$app/environment';

	onMount(() => {
		console.log(`onMount /`);
		validateAccount();
		goto('/login');
	});

	const authSub = authStore.subscribe((value) => {
		console.log(`changes in login: ${value != null}`);
		if (!browser) return;
		if (value) {
			goto('/home/app_management');
		}
	});

	onDestroy(() => {
		authSub();
		console.log('/ destroyed');
	});
</script>

<body>
	<h1>Welcome to Task Management System</h1>
	<a href="/login"> Go to login</a>
</body>

<style>
	/* Centering the login div */
	body {
		margin: 0;
		justify-content: center;
		align-items: center;
		background-color: #f4f4f4; /* Optional background color for the page */
	}
</style>
