// __mocks__/react-three-cannon.js

module.exports = {
	useBox: () => [jest.fn(), {}],
	useSphere: () => [jest.fn(), {}],
	useCylinder: () => [jest.fn(), {}],
	usePlane: () => [jest.fn(), {}],
	RigidBody: ({ children }) => <>{children}</>, // Simple passthrough
	Physics: ({ children }) => <>{children}</>, // Simple passthrough
};

