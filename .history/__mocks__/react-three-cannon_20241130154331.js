// __mocks__/react-three-cannon.js

const React = require("react");

module.exports = {
	useBox: () => [jest.fn(), {}],
	useSphere: () => [jest.fn(), {}],
	useCylinder: () => [jest.fn(), {}],
	usePlane: () => [jest.fn(), {}],
	RigidBody: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
	P
physics: ({ children }) =>
		React.createElement(React.Fragment, null, children), // Simple passthrough
};
