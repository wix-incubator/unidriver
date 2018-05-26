import * as React from 'react';

export type TodoItem = {
	label: string;
	completed: boolean;
	id?: string;
};

export type TodoItemProps = {
	item: TodoItem;
	onToggle: () => void;
};

class TodoAppItem extends React.Component<TodoItemProps, {}> {
	render () {
		const {item, onToggle} = this.props;
		return (
		<div className={`todo-item${item.completed ? ' done' : ''}`} data-value={item.id}>
				<span className='label'>{item.label}</span>
				{item.completed ? <span className='completed'>Completed!</span> : null}
				<button className='toggle' onClick={onToggle}>Toggle</button>
			</div>
			);
	}
}

export type TodoAppProps = {
	items: TodoItem[];
	initialText?: string;
};

export class TodoApp extends React.Component<TodoAppProps, any> {
	state = {
		newItem: this.props.initialText || '',
		items: this.props.items
	};

	onToggle = (idx: number) => () => {
		const items = this.state.items;
		const item = items[idx];
		const newItems = items.map((i, itemIdx) => idx === itemIdx ? {...i, completed: !item.completed} : i);
		this.setState({items: newItems});
	}

	onAdd = () => {
		const items = this.state.items;
		this.setState({items: [...items, {label: this.state.newItem, completed: false}], newItem: ''});
	}

	render () {
		const {items} = this.state;
		return (
		<div>
				<header>
					<input value={this.state.newItem} onChange={(e) => this.setState({newItem: e.target.value})}/>
					<button className='add' onClick={this.onAdd}>Add</button>
				</header>
				<main>
					{items.map((item, idx) => <TodoAppItem key={idx} item={item} onToggle={this.onToggle(idx)}/>)}
				</main>
				<footer>
					Items count: <span className='count'>{items.length}</span>
				</footer>
			</div>);
	}
}
