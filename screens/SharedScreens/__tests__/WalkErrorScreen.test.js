import React from "react";
import renderer from "react-test-renderer";
import { render, act, fireEvent } from "@testing-library/react-native";

import WalkErrorScreen from "../WalkErrorScreen";
import { AuthProvider } from "../../../contexts/AuthProvider";

export const createTestProps = (props) => ({
  filename: "RandomScreen.js",
});

let props;
let component;
let screen;

describe("WalkErrorScreen ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <WalkErrorScreen filename={props.filename} />
      </AuthProvider>
    );

    screen = render(component);
  });

  it("renders correctly", () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("signs out upon button press", () => {
    let signoutButton = screen.getByLabelText("Sign out");
    expect(signoutButton).toBeTruthy();

    act(() => {
      fireEvent.press(signoutButton);
    });
  });
});
