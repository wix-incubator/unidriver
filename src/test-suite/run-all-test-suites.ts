import { UniDriver } from '../lib';
import {TestSuiteParams} from '.';
import {runTestSuite as runTodoAppTestSuite} from './react-todoapp/run-test-suite';
import {runTestSuite as runKeyboardEventsAppTestSuite} from './react-keyboard-events-app/run-test-suite';
import {TodoAppProps} from './react-todoapp/react-todoapp';
import {KeyboardEventsAppProps} from './react-keyboard-events-app/react-keyboard-events-app';

export type RunTestFn<P> = (init: P, test: (driver: UniDriver) => Promise<any>) => Promise<void>;

export const runAllTestSuites = ({todoAppParams, keyboardEventsAppParams}: Partial<{
    todoAppParams: TestSuiteParams<TodoAppProps>,
    keyboardEventsAppParams: TestSuiteParams<KeyboardEventsAppProps>
}>) => {
    if (todoAppParams) {
        runTestSuite<TodoAppProps>({
            appName: 'Todo App',
            params: todoAppParams,
            tests: (runTest) => runTodoAppTestSuite(runTest)
        });
    }

    if (keyboardEventsAppParams) {
        runTestSuite<KeyboardEventsAppProps>({
            appName: 'Keyboard Events App',
            params: keyboardEventsAppParams,
            tests: (runTest) => runKeyboardEventsAppTestSuite(runTest)
        });
    }
};

type RunTestSuiteParams<P> = {appName: string; params: TestSuiteParams<P>; tests: (runTest: RunTestFn<P>) => void};

const runTestSuite = <P>({appName, params, tests}: RunTestSuiteParams<P>) => {
    const runTest = async (init: P, test: (driver: UniDriver) => Promise<any>) => {
        const {driver, tearDown} = await params.setup(init);

        try {
            await test(driver);
            await tearDown();
        } catch (e) {
            await tearDown();
            throw e;
        }
    };

	describe(`Unidriver "${appName}" test suite`, () => {
		before(async () => {
			if (params.before) {
				await params.before();
			}
		});

		after(async () => {
			if (params.after) {
				await params.after();
			}
		});

        tests(runTest);
	});
};
