import React from "react";
import renderer from "react-test-renderer";
import { render } from "@testing-library/react-native";

import { NavigationContainer } from "@react-navigation/native";

import LoggedOutNavigation from "../LoggedOutNavigation";
import { AuthProvider } from "../../contexts/AuthProvider";

const createTestProps = () => ({
  initialRouteName: "UserLogin",
  screenOptions: {
    headerShown: false,
  },
});

let props;
let component;

describe("LoggedOutNavigation ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <NavigationContainer>
          <LoggedOutNavigation {...props} />;
        </NavigationContainer>
      </AuthProvider>
    );
  });

  it("renders correctly", () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("contains the correct title", () => {
    const { getByText } = render(component);

    expect(getByText("User Login")).toBeTruthy();
  });
});
