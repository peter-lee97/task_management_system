<script lang="ts">
	import { AxiosError } from 'axios';
	import * as AuthAPI from '../services/api/auth';
	import { onDestroy, onMount } from 'svelte';
	import { accountStore } from '../store/auth';
	import type { Account } from '../model';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let username: string | undefined;
	let password: string | undefined;
	let errorMessage: string | undefined;

	$: showButton = username !== null && password !== null && username !== '' && password !== '';

	onMount(() => {
		if (data.user != null) {
			accountStore.set(data.user);
			goto('/app');
		}
	});

	onDestroy(() => {
		console.log('/ destroyed');
	});

	async function login() {
		console.log(`username: ${username} | password: ${password}`);
		if (username == undefined || password == undefined) {
			console.log(`entries are found empty`);
			return;
		}
		try {
			const response = await AuthAPI.login(username, password);
			console.log(JSON.stringify(response['results']));
			accountStore.set(response['results'] as Account);
			goto('/app_management');
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
