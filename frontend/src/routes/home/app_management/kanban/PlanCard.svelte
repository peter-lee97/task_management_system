<script lang="ts">
	import Modal from '$components/Modal.svelte';
	import { logoutAccount } from '$lib/authStore';
	import { validateColor, validatePlanName } from '$lib/validate';
	import { addDays, createPlan, fromDateString } from '$services';
	import { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	export let appAcronym: string;
	export let showModal: boolean;
	let planName: string;
	let startDate = new Date();
	let startDateString = startDate.toISOString().substring(0, 10);
	let endDateString = addDays(startDate, 14).toISOString().substring(0, 10);
	let planColor: string;

	const submitHandler = async () => {
		console.log(`submit handler`);

		const planError = validatePlanName(planName);
		const colorError = validateColor(planColor);
		if (planError) {
			toast.error(planError);
			return;
		} else if (colorError) {
			toast.error(colorError);
			return;
		}

		createPlan({
			Plan_app_Acronym: appAcronym,
			Plan_MVP_name: planName,
			Plan_color: planColor,
			Plan_endDate: fromDateString(endDateString),
			Plan_startDate: fromDateString(startDateString)
		})
			.then((newPlan) => {
				if (newPlan == null) {
					toast.error('failed to create plan');
				} else if (newPlan) {
					toast.success(`New plan (${newPlan?.Plan_app_Acronym}) created`);
					planName = '';
					planColor = '';
				}
			})
			.catch((e) => {
				let errorMessage = 'failed to create plan';
				if (e instanceof AxiosError) {
					errorMessage = e.response?.data.message ?? errorMessage;
					if (e.status == 401) logoutAccount();
				}
				toast.error(errorMessage);
			});
	};
</script>

<Modal {showModal}>
	<h3 style="text-align: center;">Create Plan</h3>
	<div class="plan-canvas-form">
		<div class="entry-row">
			<div class="left-container">App Acronym</div>
			<div class="right-container">{appAcronym}</div>
		</div>
		<div class="entry-row">
			<div class="left-container">Plan Name</div>
			<div class="right-container">
				<input type="text" placeholder="Name" bind:value={planName} />
			</div>
		</div>
		<div class="entry-row">
			<div class="left-container">Start Date</div>
			<div class="right-container"><input type="date" bind:value={startDateString} /></div>
		</div>
		<div class="entry-row">
			<div class="left-container">End Date</div>
			<div class="right-container"><input type="date" bind:value={endDateString} /></div>
		</div>
		<div class="entry-row">
			<div class="left-container">Color</div>
			<input
				class="right-container"
				type="color"
				bind:value={planColor}
				placeholder="Color not selected"
			/>
		</div>
		<div class="action-buttons">
			<button type="submit" on:click={submitHandler}>Create Plan</button>
			<button type="button" on:click={() => (showModal = !showModal)}>Cancel</button>
		</div>
	</div>
</Modal>

<style>
	.action-buttons {
		margin-top: 20px;
		justify-content: center;
		gap: 20px;
		display: flex;
	}
	.right-container,
	.left-container {
		font-size: 15;
	}
	.left-container {
		font-weight: 700;
		flex: 4;
	}
	.right-container {
		flex: 7;
	}

	.plan-canvas-form {
		justify-content: center;
		width: 60vh;
		padding: 10px 80px;
	}
	.entry-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	button {
		background-color: black;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		width: 100%;
		font-size: 16px;
	}

	input[type='color'] {
		width: 100%; /* Make sure it takes full width */
		height: 40px; /* Set a fixed height to ensure it's visible */
		padding: 0;
		border: none; /* Remove any unwanted borders */
		appearance: none; /* Remove default styles for consistency */
		background: none; /* Make sure the background isn't overriding */
	}
</style>
