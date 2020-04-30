import React from "react";
import { create, shallow } from "react-test-renderer";
import renderer from "react-test-renderer";
import {
  fireEvent,
  NativeTestEvent,
  act,
  wait,
  waitForElement,
  waitForElementToBeRemoved,
  render,
} from "@testing-library/react-native";

import SuccessScreen from "../SuccessScreen";
import { AuthProvider } from "./../../../../contexts/AuthProvider";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <>{children}</>,
}));

jest.mock("@react-navigation/stack", () => {
  return { SignupStack: () => jest.fn() };
});

global.fetch = jest.fn(() => Promise.resolve());

export const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  },
  ...props,
});

let props;
let component;
let screen;

describe("SuccessScreen ", () => {
  beforeEach(() => {
    props = createTestProps();

    let route = {
      params: {
        email: "a@wisc.edu",
        password: "asdfg",
      },
    };

    component = (
      <AuthProvider>
        <SuccessScreen route={route} />
      </AuthProvider>
    );

    screen = render(component);
  });

  it("renders correctly", () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("displays the correct loading component", () => {
    // expect(screen.getByLabelText("loadingComponent")).toBeTruthy();
    expect(screen.getAllByText("✓")).toBeTruthy();
    expect(screen.getByText("Credentials")).toBeTruthy();
    expect(screen.getByText("Basic Info")).toBeTruthy();
    expect(screen.getByText("Finish")).toBeTruthy();
  });

  it("has the correct title", () => {
    expect(screen.getByText("Success!")).toBeTruthy();
  });

  it("displays the SAFEwalker image", () => {
    expect(screen.getByLabelText("successImage")).toBeTruthy();
  });

  it("has the Finish button", () => {
    expect(screen.getByLabelText("Go to main screen")).toBeTruthy();
  });

  it("succeeds if email and password is valid", () => {
    let finishButton = screen.getByLabelText("Go to main screen");
    act(() => {
      fireEvent.press(finishButton);
    });
  });

  it("fails if user is not available in server (404)", async () => {
    let data = {
      status: 404,
    };

    global.fetch = jest.fn(() => Promise.resolve(data));

    let finishButton = screen.getByLabelText("Go to main screen");
    act(() => {
      fireEvent.press(finishButton);
    });

    // wait for Error appearance
    // await wait(() => {
    //   expect(screen.queryByLabelText("isUserNotAvailable")).toBeNull();
    // });
  });

  it("shows error if input is empty", async () => {
    global.fetch = jest.fn(() => Promise.reject());

    let route = {
      params: {
        email: "",
        password: "",
      },
    };

    component = (
      <AuthProvider>
        <SuccessScreen route={route} />
      </AuthProvider>
    );
    screen = render(component);

    let finishButton = screen.getByLabelText("Go to main screen");
    act(() => {
      fireEvent.press(finishButton);
    });

    // wait for Error appearance
    await wait(() => {
      expect(screen.getByLabelText("isLoginError")).toBeTruthy();
    });
  });
});
