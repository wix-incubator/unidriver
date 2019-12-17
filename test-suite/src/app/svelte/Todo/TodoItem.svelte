<script>
    export let item;
    export let isActive;

    export let onToggle;
    export let onHover;
    export let onBlur;

</script>
<style>

</style>

<div class={`todo-item ${isActive ? 'active' : ''} ${item.completed ? 'done' : ''}`}
     on:mouseenter={onHover}
     on:mouseleave={onBlur}
     data-value={item.id}
>
    <span class='label'>{item.label}</span>
    {#if item.completed}
        <span class='completed'>Completed!</span>
    {/if}
    <button class='toggle' on:click={onToggle}>Toggle</button>
</div>
