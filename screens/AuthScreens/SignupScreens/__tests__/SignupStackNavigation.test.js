import React from "react";
import renderer from "react-test-renderer";
import { render } from "@testing-library/react-native";
import { CardStyleInterpolators } from "@react-navigation/stack";

import { NavigationContainer } from "@react-navigation/native";

import SignupStackNavigation from "../SignupStackNavigation";
import colors from "./../../../../constants/colors";

const createTestProps = (props) => ({
  initialRouteName: "Credentials",
  screenOptions: {
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    headerStyle: {
      backgroundColor: colors.lightorange,
    },
    headerTintColor: "#fff",
    headerTitleAlign: "center",
  },
});

let props;
let component;
let screen;

describe("SignupStackNavigation ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <NavigationContainer>
        <SignupStackNavigation {...props} />;
      </NavigationContainer>
    );
  });

  it("renders correctly", () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("contains the correct header", () => {
    const { getByText } = render(component);

    const header = getByText("Sign up");
    expect(header).toBeTruthy();
  });
});
