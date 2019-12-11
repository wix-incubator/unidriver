<script>
	import Todo from './Todo/Todo.svelte'
	import Events from './Events/Events.svelte';

	export let initialText = undefined;
	export let initialItems = undefined;
</script>

<main>
	<Todo initialText={initialText} initialItems={initialItems} />
	<Events />
</main>
