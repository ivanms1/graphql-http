import React, { Component } from 'react';

class Form extends Component {
	render() {
		const { path, onChange, onSubmit } = this.props;
		return (
			<form onSubmit={onSubmit}>
				<label htmlFor="url">Show open issues for https://github.com/</label>
				<input
				 id="url"
				 type="text"
				 onChange={onChange}
				 style={{ width: '300px' }}
				 value={path}
				 />
				 <button type="submit">Search</button>
			</form>
		);
	}
}

export default Form