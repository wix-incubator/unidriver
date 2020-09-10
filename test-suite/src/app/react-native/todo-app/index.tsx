import * as React from 'react';
import {View, CheckBox, Text, Button, TextInput} from 'react-native';
import classNames from 'classnames';
import {TodoAppProps, TodoItem} from "../../../types";

export type TodoItemProps = {
	item: TodoItem;
	isActive: boolean;
	onToggle: () => void;
	onHover: () => void;
	onBlur: () => void;
};


class TodoAppItem extends React.Component<TodoItemProps> {
  render () {
		const {item, isActive, onToggle} = this.props;
		const cn = classNames({
			active: isActive,
			done: item.completed
		});

		const style = {backgroundColor: isActive ? 'red' : ''};

		return (
			<View testID={`todo-item ${cn}`} data-value={item.id} style={style}>
        <CheckBox value={item.completed} />
				<Text testID='label'>{item.label}</Text>
				{item.completed ? <Text testID='completed'>Completed!</Text> : null}
				<Button title='Toggle' testID='toggle' onPress={onToggle} />
			</View>
		);
	}
}

type TodoAppState = {
	newItem: string;
	items: TodoItem[];
	activeItem: number;
};

export class TodoApp extends React.Component<TodoAppProps, TodoAppState> {
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

	onChange = (e: any) => {
		this.setState({newItem: e.target.value});
	};

	onAdd = () => {
		const items = this.state.items;
		this.setState({items: [...items, {label: this.state.newItem, completed: false}], newItem: ''});
	};

	// onKeyDown = (e: React.KeyboardEvent) => {
	// 	e.preventDefault();
	// 	if (e.key === 'Enter') {
	// 		this.onAdd();
	// 	}
	// };

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
		<View testID='todo-app'>
				<View>
					<TextInput value={this.state.newItem} onChangeText={this.onChange} placeholder={"this is a placeholder"}/>
					<Button title='Add' testID='add' onPress={this.onAdd} />
				</View>
				<View>
					{itemsComp}
				</View>
				<View>
					<CheckBox  value={true} />
          <Text>Mark all as completed</Text>
					<Text>Items count: </Text>
          <Text testID='count'>{items.length}</Text>
				</View>
			</View>);
	}
}
