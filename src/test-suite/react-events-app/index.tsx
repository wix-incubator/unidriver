import * as React from 'react';

export type KeyboardEventsAppProps = {};

export type EventsAppState = {
	keyboardEvents: React.KeyboardEvent[];
}


export class EventsApp extends React.Component<KeyboardEventsAppProps, EventsAppState> {

	state = {
		keyboardEvents: []
	}

	onKeyPress = (e: React.KeyboardEvent) => {
		const {keyboardEvents} = this.state;
		const eventObj = {...e, key: e.key, keyCode: e.keyCode};
		this.setState({keyboardEvents: [...keyboardEvents, eventObj]});
	}

	render () {
		const { state } = this;

		const keyboardEventComp = (event: React.KeyboardEvent, idx: number) => {
			return (
				<div key={idx} className='event-data'>
					<span className='event-key'>{event.key}</span>
				</div>
			)
		}

		return (
			<div className='events-container'>
				<input onKeyDown={this.onKeyPress} value='' />
				{state.keyboardEvents.map(keyboardEventComp)}
			</div>
		);
	}
}
