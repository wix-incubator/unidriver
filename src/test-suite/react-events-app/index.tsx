import * as React from 'react';

export type KeyboardEventsAppProps = {};

export type EventsAppState = {
	keyboardEvents: React.KeyboardEvent[];
	mouseEvents: React.MouseEvent[];
}


export class EventsApp extends React.Component<KeyboardEventsAppProps, EventsAppState> {

	state = {
		keyboardEvents: [],
		mouseEvents: []
	}

	onKeyboardEvent = (e: React.KeyboardEvent) => {
		const {keyboardEvents} = this.state;
		const eventObj = {...e, key: e.key, keyCode: e.keyCode};
		this.setState({keyboardEvents: [...keyboardEvents, eventObj]});
	}

	onMouseEvent = (e: React.MouseEvent) => {
		const {mouseEvents} = this.state;
		const eventObj = {...e, type: e.type};
		this.setState({mouseEvents: [...mouseEvents, eventObj]});
	}

	render () {
		const { state } = this;

		const keyboardEventComp = (event: React.KeyboardEvent, idx: number) => {
			return (
				<div key={idx} className='keyboard-event-data'>
					<span className='event-key'>{event.key}</span>
				</div>
			)
		}

		const mouseEventComp = (event: React.MouseEvent, idx: number) => {
			return (
				<div key={idx} className='mouse-event-data'>
					<span className='event-type'>{event.type}</span>
					<span className='event-client-x'>{event.clientX}</span>
					<span className='event-client-y'>{event.clientY}</span>
				</div>
			)
		}

		return (
			<div className='events-container'>
				<div className='keyboard-events'>
					<input onKeyDown={this.onKeyboardEvent} value='' />
					<div>{state.keyboardEvents.map(keyboardEventComp)}</div>
				</div>
				<div className='mouse-events'>
					<button onMouseDown={this.onMouseEvent} onMouseUp={this.onMouseEvent} onMouseMove={this.onMouseEvent}/>
					<div>{state.mouseEvents.map(mouseEventComp)}</div>
				</div>
			</div>
		);
	}
}
