import * as React from 'react';
import { UniDriver } from '..';

export type TodoItem = {
	title: string;
	done: boolean;
	id?: string;
};

export type TodoItemProps = {
	item: TodoItem;
	onToggle: () => void;
};

export const todoAppItemDriver = (bd: UniDriver) => {
	return {
		toggle: () => {
			return bd.$('.toggle').click();
		},
		title: () => bd.$('.title').text()
	};
};

class TodoAppItem extends React.Component<TodoItemProps, {}> {
	render () {
		const {item, onToggle} = this.props;
		return (
		<div className={`item${item.done ? ' done' : ''}`} data-value={item.id}>
				<span className='title'>{item.title}</span>
				<button className='toggle' onClick={onToggle}>Toggle</button>
			</div>
			);
	}
}

export type TodoAppProps = {
	items: TodoItem[];
};

export class TodoApp extends React.Component<TodoAppProps, any> {
	state = {
		newItem: '',
		items: this.props.items
	};

	onToggle = (idx: number) => () => {
		const items = this.state.items;
		const item = items[idx];
		const newItems = items.map((i, itemIdx) => idx === itemIdx ? {...i, done: !item.done} : i);
		this.setState({items: newItems});
	};

	onAdd = () => {
		const items = this.state.items;
		this.setState({items: [...items, {title: this.state.newItem, done: false}], newItem: ''});
	};

	render () {
		return (
		<div>
				<header>
					<input value={this.state.newItem} onChange={(e) => this.setState({newItem: e.target.value})}/>
					<button className='add' onClick={this.onAdd}>Add</button>
				</header>
				<main>
					{this.state.items.map((item, idx) => <TodoAppItem key={idx} item={item} onToggle={this.onToggle(idx)}/>)}
				</main>

			</div>);
	}
}

export type MultiTodoAppProps = {
	data: TodoItem[][];
};

export class MultiTodoApp extends React.Component<MultiTodoAppProps, any> {

	renderSingle = (items: TodoItem[]) => {
		return (
		<div className='app-wrapper'>
			<TodoApp items={items}/>
		</div>
		);
	};

	render () {
		return (
		<div>
			{this.props.data.map(this.renderSingle)}
		</div>);
	}
}
