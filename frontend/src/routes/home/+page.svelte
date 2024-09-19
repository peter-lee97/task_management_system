<script lang="ts">
	import { goto } from '$app/navigation';

	export function load() {
		console.log(`redirecting`);
		goto('/app_management');
	}
</script>
