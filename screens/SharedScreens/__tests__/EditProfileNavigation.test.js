import React from "react";
import renderer from "react-test-renderer";
import { render } from "@testing-library/react-native";
import { CardStyleInterpolators } from "@react-navigation/stack";

import { NavigationContainer } from "@react-navigation/native";

import EditProfileNavigation from "../EditProfileNavigation";
import { AuthProvider } from "./../../../contexts/AuthProvider";
import colors from "./../../../constants/colors";

const createTestProps = (props) => ({
    initialRouteName: "EditProfile",
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

describe("EditProfileNavigation ", () => {
    beforeEach(() => {
        props = createTestProps();

        component = (
            <AuthProvider>
                <NavigationContainer>
                    <EditProfileNavigation {...props} />;
                </NavigationContainer>
            </AuthProvider>
        );
    });

    it("renders correctly", () => {
        const tree = renderer.create(component).toJSON();
        expect(tree).toMatchSnapshot();
    });
});