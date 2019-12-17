<script>
    import MouseEvent from './MouseEvent.svelte';
    import KeyboardEvent from './KeyboardEvent.svelte';

    let keyboardEvents = [];
    let mouseEvents = [];

    const handleMouseEvent = (event) => {
        mouseEvents[mouseEvents.length] = { type: event.type, clientX: event.clientX, clientY: event.clientY }
    };

    const handleKeyboardEvent = (event) => {
        keyboardEvents[keyboardEvents.length] = { key: event.key, keyCode: event.keyCode };
    }
</script>

<style>
    .button {
        width: 100px;
        height: 100px;
    }
</style>

<div class='events-container'>
    <div class='mouse-events'>
        <button class="button" on:mousedown={handleMouseEvent} on:mouseup={handleMouseEvent}
                on:mousemove={handleMouseEvent}>
            Mouse Events
        </button>
        {#each mouseEvents as event}
            <MouseEvent event={event} />
        {/each}
    </div>
    <div class='keyboard-events'>
        <input on:keydown|preventDefault={handleKeyboardEvent} value='' />
        {#each keyboardEvents as event}
            <KeyboardEvent event={event} />
        {/each}
    </div>
</div>
