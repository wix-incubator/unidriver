import * as React from 'react';

export type KeyboardEventsAppProps = {};

export type EventsAppState = {
    keyboardEvents: React.KeyboardEvent[];
}

const KeyboardEventComp = ({event}: { event: React.KeyboardEvent }) => {
     // `whiteSpace: pre` is needed for tests that run in browsers + Space key
    return (
        <div className='event-data'>
            <span className='event-key' style={{whiteSpace: 'pre'}}>{event.key}</span>
            <span className='event-keycode'>{event.keyCode}</span>
        </div>
    );
};

export class EventsApp extends React.Component<KeyboardEventsAppProps, EventsAppState> {

    state = {
        keyboardEvents: []
    };

    onKeyDown = (e: React.KeyboardEvent) => {
        const {keyboardEvents} = this.state;
        const eventObj = {...e, key: e.key, keyCode: e.keyCode};
        this.setState({keyboardEvents: [...keyboardEvents, eventObj]});
    };

    render() {
        const {keyboardEvents} = this.state;

        return (
            <div className='events-container'>
                <input onKeyDown={this.onKeyDown} value=''/>
                <div>
                    {keyboardEvents.map((e, idx) => <KeyboardEventComp key={idx} event={e}/>)}
                </div>
            </div>
        );
    }
}
