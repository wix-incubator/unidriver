import * as React from 'react';
import { create as render } from 'react-test-renderer';
import { TodoAppProps } from '../../types';
import { TodoApp } from './todo-app';

export const renderTestApp = (params: TodoAppProps) => {
  return render(<TodoApp {...params} />).root;
};
