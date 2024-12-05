// __mocks__/react-three-rapier.js

const React = require("react");

module.exports = {
	Physics: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
	RigidBody: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
};
