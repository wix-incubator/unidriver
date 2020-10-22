import { TodoItem } from "./types";

export const itemCreator = (partial: Partial<TodoItem>) => {
  return {
    label: "default",
    completed: false,
    ...partial,
  };
};

export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
