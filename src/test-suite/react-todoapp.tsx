import * as React from 'react';
import * as classNames from 'classnames';

export type TodoItem = {
	label: string;
	completed: boolean;
	id?: string;
};

export type TodoItemProps = {
	item: TodoItem;
	isActive: boolean;
	onToggle: () => void;
	onHover: () => void;
	onBlur: () => void;
};

class TodoAppItem extends React.Component<TodoItemProps, {}> {
	render () {
		const {item, isActive, onToggle, onHover, onBlur} = this.props;
		const cn = classNames({
			active: isActive,
			done: item.completed
		});

		const style = {backgroundColor: isActive ? 'red' : ''};

		return (
			<div className={`todo-item ${cn}`} onMouseEnter={onHover} onMouseLeave={onBlur} data-value={item.id} style={style}>
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
		items: this.props.items,
		activeItem: -1
	};

	onToggle = (idx: number) => () => {
		const items = this.state.items;
		const item = items[idx];
		const newItems = items.map((i, itemIdx) => idx === itemIdx ? {...i, completed: !item.completed} : i);
		this.setState({items: newItems});
	};

	onAdd = () => {
		const items = this.state.items;
		this.setState({items: [...items, {label: this.state.newItem, completed: false}], newItem: ''});
	};
	
	onKeyPress = (e: React.KeyboardEvent) => {
		e.preventDefault();
		if (e.key === 'Enter') {
			this.onAdd();
		}
	};

	onHover = (idx: number) => () => {
		this.setState({activeItem: idx});
	};

	onBlur = () => this.setState({activeItem: -1});

	render () {
		const {items, activeItem} = this.state;
		const itemsComp = items.map((item, idx) => {
			const isActive = idx === activeItem;
			return (
				<TodoAppItem key={idx} item={item} isActive={isActive} onToggle={this.onToggle(idx)} onHover={this.onHover(idx)} onBlur={this.onBlur}/>
			);
		});

		return (
		<div>
				<header>
					<input value={this.state.newItem} onChange={(e) => this.setState({newItem: e.target.value})}/>
					<button className='add' onClick={this.onAdd} onKeyPress={this.onKeyPress}>Add</button>
				</header>
				<main>
					{itemsComp}
				</main>
				<footer>
					Items count: <span className='count'>{items.length}</span>
				</footer>
			</div>);
	}
}
