<script lang="ts">
	import { AxiosError } from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, validateAccount } from '$lib/authStore';
	import '../../app.css';
	import { login } from '../../services/api/auth';
	import { Toaster, toast } from 'svelte-sonner';

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

	async function loginHandler() {
		console.log(`username: ${username} | password: ${password}`);
		if (username == undefined || password == undefined) {
			console.log(`entries are found empty`);
			return;
		}

		try {
			const response = await login(username, password);
			authStore.set(response);
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
		if (errorMessage) toast.error(errorMessage);
	}
</script>

<body>
	<div class="login-div">
		<form on:submit|preventDefault={loginHandler}>
			<div class="login-title">Login</div>
			<input type="text" bind:value={username} placeholder="Username" />
			<br />
			<input type="password" bind:value={password} placeholder="Password" />
			<input type="submit" value="Login" disabled={!showButton} />
			<!-- {#if errorMessage}
				<div class="error-message" style="color:red">{errorMessage}</div>
			{/if} -->
		</form>
	</div>
	<Toaster />
</body>

<style>
	input[type='password'],
	input[type='text'] {
		background-color: #c9c9c9;
	}
	body {
		margin: 0;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
	}

	.login-div {
		width: 300px; /* Set a fixed width for the login form */
		text-align: center;
		background-color: white;
		border-radius: 8px;
	}

	.login-title {
		font-weight: 700;
		font-size: 32px;
		text-align: center;
		margin-bottom: 16px; /* Spacing between title and inputs */
	}
</style>
