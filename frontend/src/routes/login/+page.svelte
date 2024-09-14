<script lang="ts">
	import { AxiosError } from 'axios';
	import * as AuthAPI from '../../services/api/auth';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, validateAccount } from '$lib/authStore';

	let username: string | undefined;
	let password: string | undefined;
	let errorMessage: string | undefined;

	$: showButton = username && password ? true : false;

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

<body>
	<div class="login-div">
		<form on:submit|preventDefault={login}>
			<div class="login-title">Login</div>
			<input type="text" bind:value={username} placeholder="Username" />
			<br />
			<input type="password" bind:value={password} placeholder="Password" />
			<input type="submit" value="Login" disabled={!showButton} />
			{#if errorMessage}
				<div class="error-message" style="color:red">{errorMessage}</div>
			{/if}
		</form>
	</div>
</body>

<style>
	@import '../../app.css';

	body {
		margin: 0;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #f4f4f4; /* Optional background color for the page */
	}

	.login-div {
		width: 300px; /* Set a fixed width for the login form */
		text-align: center;
		background-color: white;
		padding: 24px;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional shadow for visual effect */
	}

	.login-title {
		font-weight: 700;
		font-size: 32px;
		text-align: center;
		margin-bottom: 16px; /* Spacing between title and inputs */
	}

	/* Error message styling */
	.error-message {
		color: red;
		margin-top: 12px;
		font-size: 14px;
	}
</style>
