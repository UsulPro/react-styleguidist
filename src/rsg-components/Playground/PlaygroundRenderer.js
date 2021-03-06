import React, { PropTypes } from 'react';
import Editor from 'rsg-components/Editor';
import Preview from 'rsg-components/Preview';

const s = require('./Playground.css');

const PlaygroundRenderer = ({
	code,
	showCode,
	isCodeTyping,
	isCodeValid,
	name,
	index,
	singleExample,
	evalInContext,
	onChange,
	onCodeToggle,
	onCodeValid,
	onCodeTyping,
}) => (
	<div className={s.root}>
		<div className={s.preview + ' rsg--example-preview'}>
			{singleExample ? (
				<a className={s.isolatedLink} href={'#!/' + name}>⇽ Exit Isolation</a>
			) : (
				<a className={s.isolatedLink} href={'#!/' + name + '/' + index}>Open isolated ⇢</a>
			)}
			<Preview
				code={code}
				evalInContext={evalInContext}
				onCodeValid={onCodeValid}
				isCodeTyping={isCodeTyping}
			/>
		</div>
		{showCode ? (
			<div>
				<Editor
					code={code}
					onChange={onChange}
					isCodeTyping={isCodeTyping}
					isCodeValid={isCodeValid}
					onCodeTyping={onCodeTyping}
				/>
				<button type="button" className={s.hideCode} onClick={onCodeToggle}>
					Hide code
				</button>
			</div>
		) : (
			<button type="button" className={s.showCode} onClick={onCodeToggle}>
				Show code
			</button>
		)}
	</div>
);

PlaygroundRenderer.propTypes = {
	code: PropTypes.string.isRequired,
	showCode: PropTypes.bool.isRequired,
	isCodeTyping: PropTypes.bool.isRequired,
	isCodeValid: PropTypes.bool.isRequired,
	name: PropTypes.string.isRequired,
	index: PropTypes.number.isRequired,
	evalInContext: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	onCodeToggle: PropTypes.func.isRequired,
	singleExample: PropTypes.bool,
	onCodeValid: PropTypes.func.isRequired,
	onCodeTyping: PropTypes.func.isRequired,
};

export default PlaygroundRenderer;
