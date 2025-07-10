<script lang="ts">
	import type { SessionDTO } from '$lib/queries';

	type SessionInfoProps = { session: SessionDTO };

	let { session }: SessionInfoProps = $props();

	let localTime = $derived(new Date(session.date_start).toLocaleTimeString());
	let [hoursOffset, minutesOffset, secondsOffset] = $derived(
		session.gmt_offset.split(':').map(Number)
	);

	let trackTime = $derived(
		new Date(
			new Date(session.date_start).getTime() -
				hoursOffset * 60 * 60 * 1000 -
				minutesOffset * 60 * 1000 -
				secondsOffset * 1000
		).toLocaleTimeString()
	);

	let eventDate = $derived(new Date(session.date_start).toLocaleDateString());
</script>

<p><span class="text-sm font-bold">Track Start Time:</span> {trackTime}</p>
<p><span class="text-sm font-bold">Local Start Time:</span> {localTime}</p>
