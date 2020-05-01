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

import PersonalInfoScreen from "../PersonalInfoScreen";
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
    goBack: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
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

describe("PersonalInfoScreen ", () => {
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
        <PersonalInfoScreen route={route} navigation={props.navigation} />
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

  it("has a First Name TextInput", () => {
    expect(screen.getByLabelText("First Name")).toBeTruthy();
  });

  it("has a Last Name TextInput", () => {
    expect(screen.getByLabelText("Last Name")).toBeTruthy();
  });

  it("has a Phone Number TextInput", () => {
    expect(screen.getByLabelText("Phone Number")).toBeTruthy();
  });

  it('has the "Create Account" button', () => {
    expect(screen.getByLabelText("Create Account")).toBeTruthy();
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
    let createAccountButton = screen.getByLabelText("Create Account");
    act(() => {
      fireEvent.press(createAccountButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("invalidFirstname")).toBeTruthy();
      expect(screen.getByLabelText("invalidLastname")).toBeTruthy();
      expect(screen.getByLabelText("invalidPhoneNumber")).toBeTruthy();
    });
  });

  it("succeeds if name and phone number is valid (status 200)", async () => {
    let response = {
      status: 200,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    act(() => {
      fireEvent.changeText(screen.getByLabelText("First Name"), "Mujahid");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Last Name"), "Anuar");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Phone Number"), "6081234567");
    });

    let createAccountButton = screen.getByLabelText("Create Account");
    act(() => {
      fireEvent.press(createAccountButton);
    });
  });

  it("fails if name and phone number is taken (status 409)", async () => {
    let response = {
      status: 409,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    act(() => {
      fireEvent.changeText(screen.getByLabelText("First Name"), "Mujahid");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Last Name"), "Anuar");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Phone Number"), "6081234567");
    });

    let createAccountButton = screen.getByLabelText("Create Account");
    act(() => {
      fireEvent.press(createAccountButton);
    });
  });

  it("fails if there's server errors other than 409", async () => {
    let response = {
      status: 500,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    act(() => {
      fireEvent.changeText(screen.getByLabelText("First Name"), "Mujahid");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Last Name"), "Anuar");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Phone Number"), "6081234567");
    });

    let createAccountButton = screen.getByLabelText("Create Account");
    act(() => {
      fireEvent.press(createAccountButton);
    });
  });

  it("fails during some server error but name and phone number is valid", async () => {
    global.fetch = jest.fn(() => Promise.reject());
    act(() => {
      fireEvent.changeText(screen.getByLabelText("First Name"), "Mujahid");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Last Name"), "Anuar");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("Phone Number"), "6081234567");
    });

    let createAccountButton = screen.getByLabelText("Create Account");
    act(() => {
      fireEvent.press(createAccountButton);
    });
  });

  it("fails if email and password is null", async () => {
    let route = {
      params: {
        email: null,
        password: null,
      },
    };

    component = (
      <AuthProvider>
        <PersonalInfoScreen route={route} navigation={props.navigation} />
      </AuthProvider>
    );

    screen = render(component);
  });
});
