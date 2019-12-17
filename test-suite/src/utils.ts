import { TodoItem } from "./types";

export const itemCreator = (partial: Partial<TodoItem>) => {
    return {
        label: 'default',
        completed: false,
        ...partial
    };
};
