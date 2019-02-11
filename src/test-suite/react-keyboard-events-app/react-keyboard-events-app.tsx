import * as React from 'react';

export type KeyboardEventsAppProps = {
  count: number;
};

export class KeyboardEventsApp extends React.Component<KeyboardEventsAppProps, {}> {

  render() {
    const {count} = this.props;
    return (<button className='button'>{count}</button>);
  }
}
