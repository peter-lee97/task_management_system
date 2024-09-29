<script lang="ts">
	import { AxiosError } from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, setAccount, validateAccount } from '$lib/authStore';
	import { login } from '$services';
	import { toast } from 'svelte-sonner';
	import '../../app.css';

	let username: string | undefined;
	let password: string | undefined;
	let errorMessage: string | undefined;

	$: showButton = username && password ? true : false;

	onMount(() => {
		validateAccount();
	});
	onDestroy(() => {
		authSub();
	});

	const authSub = authStore.subscribe((value) => {
		if (value) {
			goto('/home/app_management');
		}
	});

	async function loginHandler() {
		if (username == undefined || password == undefined) {
			console.log(`entries are found empty`);
			return;
		}
		login(username, password)
			.then((response) => {
				if (response == null) return;
				setAccount(response);
				// goto('/home/app_management');
			})
			.catch((e) => {
				if (e instanceof AxiosError) {
					toast.error(e.response?.data.message ?? 'Network error. Please try again later');
				} else toast.error('Network Error. Please try again later');
			});
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
