<script lang="ts">
	import { AxiosError } from 'axios';
	import * as AuthAPI from '../services/api/auth';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, validateAccount } from '$lib/authStore';

	let username: string | undefined;
	let password: string | undefined;
	let errorMessage: string | undefined;

	$: showButton = username !== null && password !== null && username !== '' && password !== '';

	onMount(async () => {
		console.log(`onMount /`);
		await validateAccount();
	});

	const authSub = authStore.subscribe((value) => {
		console.log(`changes in login: ${value != null}`);
		if (value) {
			goto('/app_management');
		}
	});

	onDestroy(() => {
		authSub();
		console.log('/ destroyed');
	});

	async function login() {
		console.log(`username: ${username} | password: ${password}`);
		if (username == undefined || password == undefined) {
			console.log(`entries are found empty`);
			return;
		}

		try {
			AuthAPI.login(username, password).then((response) => {
				authStore.set(response);
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.response) {
					errorMessage = error.response!.data.message || 'An error occured during login';
				} else {
					errorMessage = 'Network Error. Please try again later';
				}
			} else {
				errorMessage = 'An unexpected error occured';
			}
		}
	}
</script>

<html lang="en">
	<body>
		<nav></nav>
		<div class="login">
			<form on:submit|preventDefault={login}>
				<div>Login</div>
				<input type="text" bind:value={username} />
				<br />
				<input type="text" bind:value={password} />

				{#if showButton}
					<br />
					<input type="submit" value="Login" />
				{/if}
				{#if errorMessage}
					<div style="color:red">{errorMessage}</div>
				{/if}
			</form>
		</div>
	</body>
</html>
