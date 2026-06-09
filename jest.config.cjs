module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.(js|jsx|ts|tsx)?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};
