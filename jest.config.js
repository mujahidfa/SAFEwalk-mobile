const expoPreset = require("jest-expo/jest-preset");
const jestPreset = require("@testing-library/react-native/jest-preset");

module.exports = {
  preset: "@testing-library/react-native",
  automock: false,
  modulePaths: ["<rootDir>"],
  moduleDirectories: ["node_modules"],
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  moduleFileExtensions: ["js", "svg", "png"],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.config.js",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/build/",
    "<rootDir>/node_modules/",
    "<rootDir>/.history/",
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/__mocks__/svgMock.js",
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "babel-jest",
  },
  setupFiles: [
    ...expoPreset.setupFiles,
    ...jestPreset.setupFiles,
    // '<rootDir>/test/jestSetup.ts',
  ],
  /* eslint-disable */
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|unimodules-*|sentry-expo|native-base|@sentry/.*)",
  ],
  cacheDirectory: ".jest/cache",
  // setupFilesAfterEnv: ['./test/setupTest.ts'],
  haste: {
    defaultPlatform: "ios",
    platforms: ["android", "ios", "native"],
    providesModuleNodeModules: ["react", "react-native"],
  },
};
