import React from "react";
import renderer from "react-test-renderer";
import { render } from "@testing-library/react-native";

import { NavigationContainer } from "@react-navigation/native";

import SafewalkerHomeNavigation from "../SafewalkerHomeNavigation";
import { AuthProvider } from "../../../contexts/AuthProvider";
import { WalkProvider } from "../../../contexts/WalkProvider";

const AbortController = require("abort-controller");

jest.mock("abort-controller", () => {
  return { AbortController: () => jest.fn() };
});

// jest.mock("AbortController");

const createTestProps = () => ({});

let props;
let component;

describe("SafewalkerHomeNavigation ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <WalkProvider>
          <NavigationContainer>
            <SafewalkerHomeNavigation />
          </NavigationContainer>
        </WalkProvider>
      </AuthProvider>
    );
  });

  it("placeholder", () => {});

  // it("renders correctly", () => {
  //   const tree = renderer.create(component).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // it("contains the correct header", () => {
  //   const { getByText } = render(component);

  //   expect(getByText("SAFEwalker Home")).toBeTruthy();
  // });
});
