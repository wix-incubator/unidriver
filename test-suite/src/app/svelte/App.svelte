<script>
	import Todo from './Todo/Todo.svelte'
	import Events from './Events/Events.svelte';

	export let initialText = undefined;
	export let initialItems = undefined;
	export let inputDisabled = undefined;
	export let inputReadOnly = undefined;
</script>

<main>
	<Todo initialText={initialText} initialItems={initialItems} inputDisabled={inputDisabled} inputReadOnly={inputReadOnly} />
	<Events />
</main>
