import React from "react";
import { create, shallow } from "react-test-renderer";
import renderer from "react-test-renderer";
import { View, Button } from "react-native";
import {
  fireEvent,
  NativeTestEvent,
  act,
  wait,
  waitForElementToBeRemoved,
  render,
} from "@testing-library/react-native";

import SafewalkerLoginScreen from "../SafewalkerLoginScreen";
import { AuthProvider } from "./../../../../contexts/AuthProvider";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <>{children}</>,
}));

jest.mock("@react-navigation/stack", () => {
  return { SignupStack: () => jest.fn() };
});

const createTestProps = (props) => ({
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

describe("SafewalkerLoginScreen ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <SafewalkerLoginScreen navigation={props.navigation} />
      </AuthProvider>
    );

    screen = render(component);
  });

  // it("renders correctly", () => {
  //   const tree = renderer.create(component).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  it("displays the logo", () => {
    expect(screen.getByLabelText("logo")).toBeTruthy();
  });

  it("has the correct title", () => {
    expect(screen.getByText("SAFEwalker Login")).toBeTruthy();
  });

  it("has a email TextInput", () => {
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("has a password TextInput", () => {
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it('has a "Login" button', () => {
    expect(screen.getByLabelText("Login")).toBeTruthy();
  });

  it('has a "Login as User" button', () => {
    expect(screen.getByLabelText("Login as User")).toBeTruthy();
  });

  it("shows error if input is empty", async () => {
    let loginButton = screen.getByLabelText("Login");
    act(() => {
      fireEvent.press(loginButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("emailRequired")).toBeTruthy();
      expect(screen.getByLabelText("passwordRequired")).toBeTruthy();
    });
  });

  it("shows error if email is not wisc.edu", () => {
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "test@gmail.com");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdf");
    });
  });

  it("shows error if Wisc email is not registered", () => {
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "test@wisc.com");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdf");
    });

    let loginButton = screen.getByLabelText("Login");
    act(() => {
      fireEvent.press(loginButton);
    });
  });

  it("navigates to LoggedInScreen if Wisc email is valid and registered", () => {
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "l@wisc.com");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "l");
    });

    let loginButton = screen.getByLabelText("Login");
    act(() => {
      fireEvent.press(loginButton);
    });
  });

  it('navigate to User login screen when user press the "Login as User" button', () => {
    let userButton = screen.getByLabelText("Login as User");
    act(() => {
      fireEvent.press(userButton);
    });
  });

  // it("renders correctly", () => {
  //   const tree = renderer.create(component).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
