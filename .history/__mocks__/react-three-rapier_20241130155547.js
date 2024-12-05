// __mocks__/react-three-rapier.js

const React = require("react");

module.exports = {
	Physics: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
	R
igidBody: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
};
