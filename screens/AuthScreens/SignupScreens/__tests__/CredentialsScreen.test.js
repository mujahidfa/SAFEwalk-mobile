import React from "react";
import { create, shallow } from "react-test-renderer";
import renderer from "react-test-renderer";
import {
  fireEvent,
  NativeTestEvent,
  act,
  wait,
  waitForElementToBeRemoved,
  render,
} from "@testing-library/react-native";

import CredentialsScreen from "../CredentialsScreen";
import { AuthProvider } from "./../../../../contexts/AuthProvider";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <>{children}</>,
}));

jest.mock("@react-navigation/stack", () => {
  return { SignupStack: () => jest.fn() };
});

// global.fetch = jest.fn(() => Promise.resolve());

const createTestProps = (props) => ({
  navigation: {
    navigate: jest.fn(),
    dangerouslyGetParent() {
      return {
        replace: jest.fn(),
      };
    },
  },
  ...props,
});

let props;
let component;
let screen;

describe("CredentialsScreen ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <CredentialsScreen navigation={props.navigation} />
      </AuthProvider>
    );

    screen = render(component);
  });

  // it("renders correctly", () => {
  //   const tree = renderer.create(component).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  it("displays the correct loading component", () => {
    expect(screen.getByLabelText("loadingComponent")).toBeTruthy();

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Credentials")).toBeTruthy();
    expect(screen.getByText("Basic Info")).toBeTruthy();
    expect(screen.getByText("Finish")).toBeTruthy();
  });

  it("has a email TextInput", () => {
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("has a password TextInput", () => {
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("has a Confirm password TextInput", () => {
    expect(screen.getByLabelText("Confirm password")).toBeTruthy();
  });

  it('has the "Next" button', () => {
    expect(screen.getByLabelText("Next")).toBeTruthy();
  });

  it("has a link to Login screen", () => {
    expect(screen.getByLabelText("signin")).toBeTruthy();
  });

  it("navigate to login screen when user press the login button", () => {
    let loginButton = screen.getByLabelText("signin");
    expect(loginButton).toBeTruthy();

    act(() => {
      fireEvent.press(loginButton);
    });
  });

  it("shows error if input is empty", async () => {
    let nextButton = screen.getByLabelText("Next");
    act(() => {
      fireEvent.press(nextButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("emailRequired")).toBeTruthy();
      expect(screen.getByLabelText("passwordRequired")).toBeTruthy();
      expect(screen.getByLabelText("invalidConfirmPassword")).toBeTruthy();
    });
  });

  it("shows error if email is taken (409)", async () => {
    let response = {
      status: 409,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "l@wisc.edu");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdfg");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Confirm password"), "asdfg");
    });

    // press Next button
    let nextButton = screen.getByLabelText("Next");
    act(() => {
      fireEvent.press(nextButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("invalidEmail")).toBeTruthy();
    });
  });

  it("shows error if there's other uncaptured server errors", async () => {
    let response = {
      status: 500,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "l@wisc.edu");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdfg");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Confirm password"), "asdfg");
    });

    // press Next button
    let nextButton = screen.getByLabelText("Next");
    act(() => {
      fireEvent.press(nextButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("serverError")).toBeTruthy();
    });
  });

  it("navigates to PersonalInfoScreen upon success", async () => {
    let response = {
      status: 200,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "l@wisc.edu");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdfg");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Confirm password"), "asdfg");
    });

    // press Next button
    let nextButton = screen.getByLabelText("Next");
    act(() => {
      fireEvent.press(nextButton);
    });
  });

  it("fails during some server error but name and phone number is valid", async () => {
    global.fetch = jest.fn(() => Promise.reject());

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Email"), "l@wisc.edu");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Password"), "asdfg");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Confirm password"), "asdfg");
    });

    // press Next button
    let nextButton = screen.getByLabelText("Next");
    act(() => {
      fireEvent.press(nextButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("serverError")).toBeTruthy();
    });
  });
});
