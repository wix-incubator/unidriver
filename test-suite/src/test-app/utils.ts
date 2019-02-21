import { TodoItem } from "./todo-app";

export const itemCreator = (partial: Partial<TodoItem>) => {
    return {
        label: 'default',
        completed: false,
        ...partial
    };
};
