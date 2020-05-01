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

import EditProfileScreen from "../EditProfileScreen";
import { AuthProvider } from "./../../../contexts/AuthProvider";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => <>{children}</>,
}));

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

describe("EditProfileScreen ", () => {
  beforeEach(() => {
    props = createTestProps();

    component = (
      <AuthProvider>
        <EditProfileScreen navigation={props.navigation} />
      </AuthProvider>
    );

    screen = render(component);
  });

  it("has the user's avatar", () => {
    expect(screen.getByLabelText("NoImageAvatar")).toBeTruthy();
  });

  it("has all 4 dividers", () => {
    expect(screen.getByLabelText("Divider 1")).toBeTruthy();
    expect(screen.getByLabelText("Divider 2")).toBeTruthy();
    expect(screen.getByLabelText("Divider 3")).toBeTruthy();
    expect(screen.getByLabelText("Divider 4")).toBeTruthy();
  });

  it("has the user's name", () => {
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });

  it("has the user's phone number", () => {
    expect(screen.getByLabelText("Phone")).toBeTruthy();
  });

  it("has the user's Interests", () => {
    expect(screen.getByLabelText("Interests")).toBeTruthy();
  });

  it("has the edit button", () => {
    expect(screen.getByLabelText("EditButton")).toBeTruthy();
  });

  it("switches to edit profile mode", () => {
    let editButton = screen.getByLabelText("EditButton");
    expect(editButton).toBeTruthy();

    act(() => {
      fireEvent.press(editButton);
    });
  });

  it("has the input fields after clicking the edit button", async () => {
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // wait for appearance
    await wait(() => {
      expect(screen.getByLabelText("FirstName")).toBeTruthy();
      expect(screen.getByLabelText("LastName")).toBeTruthy();
      expect(screen.getByLabelText("PhoneNumber")).toBeTruthy();
      expect(screen.getByLabelText("InterestsInput")).toBeTruthy();
    });
  });

  it("saves the user's profile information upon success", async () => {
    let response = {
      status: 200,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Switch to edit mode
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("FirstName"), "bob");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("LastName"), "johnson");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("PhoneNumber"), "9823745954");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("InterestsInput"), "Food");
    });

    // press save button
    let saveButton = screen.getByLabelText("saveButton");
    act(() => {
      fireEvent.press(saveButton);
    });
  });

  it("shows error if there's other uncaptured server errors", async () => {
    let response = {
      status: 500,
    };

    global.fetch = jest.fn(() => Promise.resolve(response));

    // Switch to edit mode
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("FirstName"), "bob");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("LastName"), "johnson");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("PhoneNumber"), "9823745954");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("InterestsInput"), "Food");
    });

    // press save button
    let saveButton = screen.getByLabelText("saveButton");
    act(() => {
      fireEvent.press(saveButton);
    });
  });

  it("shows error if there's other uncaptured server errors", async () => {
    global.fetch = jest.fn(() => Promise.reject());

    // Switch to edit mode
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // Change inputs
    act(() => {
      fireEvent.changeText(screen.getByLabelText("FirstName"), "bob");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("LastName"), "johnson");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("PhoneNumber"), "9823745954");
    });
    act(() => {
      fireEvent.changeText(screen.getByLabelText("InterestsInput"), "Food");
    });

    // press save button
    let saveButton = screen.getByLabelText("saveButton");
    act(() => {
      fireEvent.press(saveButton);
    });
  });

  it("clicks the edit image button", async () => {
    // Switch to edit mode
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // press save button
    let NoImageAvatarEdit = screen.getByLabelText("NoImageAvatarEdit");
    act(() => {
      fireEvent.press(NoImageAvatarEdit);
    });
  });

  it("clicks the edit image button", async () => {
    // Switch to edit mode
    let editButton = screen.getByLabelText("EditButton");
    act(() => {
      fireEvent.press(editButton);
    });

    // press save button
    let NoImageAvatarEdit = screen.getByLabelText("NoImageAvatarEdit");
    act(() => {
      fireEvent.press(NoImageAvatarEdit);
    });
  });
});
