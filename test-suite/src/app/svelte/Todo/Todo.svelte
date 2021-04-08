<script>
    import TodoItem from './TodoItem.svelte';

    export let initialText;
    export let initialItems;
    export let inputDisabled;
    export let inputReadOnly;

    let activeItemIndex = null;
    let items = initialItems || [];
    let inputValue = initialText || '';

    const handleInputChange = (e) => {
        inputValue = e.target.value;
    };

    const handleAddButtonClick = () => {
        items[items.length] = { id: Math.random(), label: inputValue, completed: false };
        inputValue = '';
    };

    const generateOnToggleHandler = (itemIndex) => () => {
        items[itemIndex].completed = !items[itemIndex].completed;
    }

    const generateItemHover = (itemIndex) => () => {
        activeItemIndex = itemIndex;
    }

    const handleItemBlur = () => {
        activeItemIndex = null;
    }

    const handleAddButtonKeydown = (e) => {
        if (e.key === 'Enter') {
            handleAddButtonClick();
        }
    }

</script>

<div class='todo-app'>
    <header>
        <input value={inputValue} on:change|preventDefault={handleInputChange}
               placeholder="this is a placeholder" disabled={inputDisabled} readOnly={inputReadOnly}/>
        <button class='add' on:click={handleAddButtonClick} on:keydown|preventDefault={handleAddButtonKeydown} type="button">Add
        </button>
    </header>
    <main>
        {#each items as item, index}
            <TodoItem item={item} onToggle={generateOnToggleHandler(index)} isActive={index === activeItemIndex}
                      onHover={generateItemHover(index)} onBlur={handleItemBlur}/>
        {/each}
    </main>
    <footer>
        <input type="checkbox" checked/>Mark all as completed<br/>
        Items count: <span class='count'>{items.length}</span>
    </footer>
</div>
