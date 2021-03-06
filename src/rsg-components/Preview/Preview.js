// Based on https://github.com/joelburget/react-live-editor/blob/master/live-compile.jsx

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { transform } from 'buble';
import PlaygroundError from 'rsg-components/PlaygroundError';
import Wrapper from 'rsg-components/Wrapper';

const compileCode = code => transform(code, {
	objectAssign: 'Object.assign',
}).code;

export default class Preview extends Component {
	static propTypes = {
		code: PropTypes.string.isRequired,
		evalInContext: PropTypes.func.isRequired,
		isCodeTyping: PropTypes.bool.isRequired,
		onCodeValid: PropTypes.func.isRequired,
	};

	constructor() {
		super();
		this.state = {
			error: null,
		};
		this.componentState = {};
		this.lastValidCode = null;
	}

	componentDidMount() {
		this.executeCode(this.props.code);
	}

	componentDidUpdate(prevProps) {
		const { code, isCodeTyping } = this.props;
		if (
			code !== prevProps.code ||
			isCodeTyping !== prevProps.isCodeTyping
		) {
			this.executeCode(code);
		}
	}

	executeCode(code, isErr) {
		ReactDOM.unmountComponentAtNode(this.mountNode);

		this.setState({
			error: null,
		});

		if (!code) {
			return;
		}

		const { isCodeTyping, onCodeValid } = this.props;

		try {
			const compiledCode = compileCode(code);

			// Initiate state and set with the callback in the bottom component;
			// Workaround for https://github.com/styleguidist/react-styleguidist/issues/155 - missed props on first render
			// when using initialState
			const initCode = `
				var React = {};  // React.createElement will throw on first load
				var initialState = {};
				try {
					${compiledCode}
				}
				catch (e) {
					// Ignoring
				}
				finally {
					__initialStateCB(initialState);
				}
			`;

			// evalInContext returns a function which takes state, setState and a callback to handle the
			// initial state and returns the evaluated code
			const initial = this.props.evalInContext(initCode);

			// 1) setup initialState so that we don't get an error;
			// 2) use require data or make other setup for the example component;
			// 3) return the example component
			const exampleComponentCode = `
				var initialState = {};
				return eval(${JSON.stringify(compiledCode)});
			`;

			const exampleComponent = this.props.evalInContext(exampleComponentCode);

			// Wrap everything in a react component to leverage the state management of this component
			class PreviewComponent extends Component { // eslint-disable-line react/no-multi-comp
				constructor() {
					super();

					const state = {};
					const initialStateCB = (initialState) => {
						Object.assign(state, initialState);
					};
					const setStateError = (partialState) => {
						const err = 'Calling setState to setup the initial state is deprecated. Use\ninitialState = ';
						Object.assign(state, { error: err + JSON.stringify(partialState) + ';' });
					};

					initial({}, setStateError, initialStateCB);
					this.state = state;
				}

				render() {
					const { error } = this.state;
					if (error) {
						return <PlaygroundError message={error} />;
					}

					return exampleComponent(this.state, this.setState.bind(this), null);
				}
			}

			const wrappedComponent = (
				<Wrapper>
					<PreviewComponent />
				</Wrapper>
			);

			ReactDOM.render(wrappedComponent, this.mountNode);
			this.lastValidCode = code;
			onCodeValid(!isErr && true);
		}
		catch (err) {
			onCodeValid(false);
			if (!isCodeTyping || isErr) {
				if (!isCodeTyping) {
					this.lastValidCode = code;
				}
				ReactDOM.unmountComponentAtNode(this.mountNode);
				this.setState({
					error: err.toString(),
				});
			}
			else {
				this.executeCode(this.lastValidCode, true);
			}
		}
	}

	render() {
		const { error } = this.state;
		return (
			<div>
				<div ref={ref => (this.mountNode = ref)}></div>
				{error && <PlaygroundError message={error} />}
			</div>
		);
	}
}
