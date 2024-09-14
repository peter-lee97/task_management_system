<script lang="ts">
	import '../../app.css';
	export let submitHandler: () => void;
	export let cancelHandler: () => void;
	export let newGroupName: string | null;
</script>

<form class="add-group-form" on:submit|preventDefault={submitHandler}>
	<h3 class="title">Add Group</h3>
	<div class="horizontal-layout">
		<label for="groupNameInput">Group Name</label>
		<input bind:value={newGroupName} type="text" id="groupNameInput" placeholder="Name" required />
	</div>
	<div class="form-buttons horizontal-layout">
		<input type="submit" value="Add" disabled={newGroupName == null || newGroupName.length == 0} />
		<input type="button" value="Cancel" on:click={cancelHandler} />
	</div>
</form>

<style>
	label {
		min-width: 100px;
		font-size: 15;
		font-weight: 700;
	}
	.horizontal-layout {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		text-align: center;
		font-weight: 700;
		font-size: 26;
	}

	.form-buttons {
		gap: 8px;
		margin-top: 10px;
	}

	.add-group-form {
		padding: 20px 40px;
		width: 400px;
	}
</style>
