import * as React from 'react';

export type TodoItem = {
	title: string;
	done: boolean;
}

export type ValComp<T> = {val: T, onChange: (newVal: T, oldVal: T) => void};


export type TodoItemViewProps = ValComp<TodoItem> & {
	onDelete: (val: TodoItem) => void;
}

export type  State = {
	items: TodoItem[],
	newItemTitle: string
}

export class TodoItemView extends React.PureComponent<TodoItemViewProps, {}> {
	onToggle = () => {
		const {val, onChange} = this.props;
		onChange({...val, done: !val.done}, val);
	}

	onDelete = () => this.props.onDelete(this.props.val);

	render() {
		const item = this.props.val;
		return (<li className={`${item.done ? 'done' : ''} item`}>
			<span className='title' onClick={this.onToggle}>{item.title}</span> <button className='delete' onClick={this.onDelete}>x</button>
		</li>);
	}
}

export class TodoApp extends React.PureComponent<{}, State> {

	state: State = {
		items: [{
			title: 'Code',
			done: true
		}, {
			title: 'Eat',
			done: false
		}],
		newItemTitle: ''
	}

	onChangeNewTitle = (e: any) => this.setState({newItemTitle: e.target.value});

	add = () => {
		const {items, newItemTitle} = this.state;
		this.setState({
			items: [{title: newItemTitle, done: false}, ...items, ],
			newItemTitle: ''
		});
	}

	change = (newVal: TodoItem, oldVal: TodoItem) => {
		const {items} = this.state;

		this.setState({items: items.map((item) => {
			return item === oldVal ? newVal : item;
		})});
	}

	remove = (itemToRemove: TodoItem) => {
		const {items} = this.state;
		this.setState({items: items.filter((item) => {
			return item !== itemToRemove;
		})});
	}

	handleKeyDown = (e: any) => {
		if (e.keyCode === 13) {
			this.add();
		}
	}

	render() {
		const {state} = this;

		return (<div className='todo-app'>
			<header><input onKeyDown={this.handleKeyDown} placeholder='new item' value={state.newItemTitle} onChange={this.onChangeNewTitle}/><button onClick={this.add}>Add</button></header>
			<main>
				<h2>Items: <span className='count'>{state.items.length}</span></h2>
				<ul>{state.items.map((item, idx) => <TodoItemView key={idx} val={item} onChange={this.change} onDelete={this.remove}/>)}</ul>
			</main>
		</div>)
	}
}
