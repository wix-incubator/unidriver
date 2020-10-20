export type TodoItem = {
    label: string;
    completed: boolean;
    id?: string;
};

export type TodoAppProps = {
    items: TodoItem[];
    initialText?: string;
    inputDisabled?: boolean;
};


export type EventsAppProps = {};

export type TestAppProps = TodoAppProps & EventsAppProps;

export type RenderTestApp = (element: HTMLElement, props?: TestAppProps) => () => any;
