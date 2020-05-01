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

import { NavigationContainer } from "@react-navigation/native";

import LoginSettingsScreen from "../LoginSettingsScreen";
import { AuthProvider } from "../../../contexts/AuthProvider";
import { WalkProvider } from "../../../contexts/WalkProvider";

const AbortController = require("abort-controller");

jest.mock("abort-controller", () => {
  return { AbortController: () => jest.fn() };
});

jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }) => <>{children}</>,
  }));

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

describe("LoginSettingsScreen ", () => {
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
            <LoginSettingsScreen route={route} navigation={props.navigation} />
          </AuthProvider>
        );
    
        screen = render(component);
      });


  it("renders correctly", () => {
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("has a current password TextInput", () => {
    expect(screen.getByLabelText("Current Password")).toBeTruthy();
  });
 
  it("has a new password TextInput", () => {
    expect(screen.getByLabelText("New Password")).toBeTruthy();
  });

  it("has a confirm password TextInput", () => {
    expect(screen.getByLabelText("Confirm Password")).toBeTruthy();
  });

  it("has a save password button", () => {
    expect(screen.getByLabelText("Save Button")).toBeTruthy();
  });

  it("shows error if current password is empty", async () => {
    let saveButton = screen.getByLabelText("Save Button");
    act(() => {
      fireEvent.press(saveButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("currentRequired")).toBeTruthy();
      expect(screen.getByLabelText("newRequired")).toBeTruthy();
      expect(screen.getByLabelText("confirmRequired")).toBeTruthy();
    });
  });

  it("shows error if current password is incorrect", () => {
    act(() => {
      fireEvent.changeText(screen.getByLabelText("Current Password"), "123");
    });

    act(() => {
      fireEvent.changeText(screen.getByLabelText("New Password"), "asdf");
    });

    act(() => {
        fireEvent.changeText(screen.getByLabelText("Confirm Password"), "asdf");
      });

      let saveButton = screen.getByLabelText("Save Button");
      act(() => {
        fireEvent.press(saveButton);
      });
  });

  it("shows error if new password does not match confirmation", () => {
    act(() => {
        fireEvent.changeText(screen.getByLabelText("New Password"), "asdfd");
      });

    act(() => {
        fireEvent.changeText(screen.getByLabelText("Confirm Password"), "asdf");
      });
  });


  it("saves the password upon success", async () => {
    let response = {
        status: 200,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Current Password"), "asdfg");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("New Password"), "pass");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Confirm Password"), "pass");
    });

    // press save button
    let saveButton = screen.getByLabelText("Save Button");
    act(() => {
        fireEvent.press(saveButton);
    });
});

  it("Alerts the user upon failure to update password", async () => {
    let response = {
        status: 409,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Current Password"), "password");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("New Password"), "pass");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Confirm Password"), "pass");
    });

    // press save button
    let saveButton = screen.getByLabelText("Save Button");
    act(() => {
        fireEvent.press(saveButton);
    });
});

it("shows error if there's other uncaptured server errors", async () => {
    global.fetch = jest.fn(() => Promise.resolve(response));

    // Change inputs
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Current Password"), "asdfg");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("New Password"), "pass");
    });
    act(() => {
        fireEvent.changeText(screen.getByLabelText("Confirm Password"), "pass");
    });

    // press save button
    let saveButton = screen.getByLabelText("Save Button");
    act(() => {
        fireEvent.press(saveButton);
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
        <LoginSettingsScreen route={route} navigation={props.navigation} />
      </AuthProvider>
    );

    screen = render(component);
  });

});
