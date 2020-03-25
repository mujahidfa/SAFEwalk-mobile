import React, { createContext, useReducer, useMemo } from "react";
import { AsyncStorage } from "react-native";

import url from "./../constants/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    // initial states
    isLoading: true,
    isSignout: false,
    userToken: null,
    userType: "user"
  });

  // Handle Login
  async function login(userType, { email, password }) {
    let isUser;
    switch (userType) {
      case "user":
        isUser = true;
      case "safewalker":
        isUser = false;
      default:
        isUser = null;
    }

    try {
      // Put code below for this: make login GET request to server
      const options = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
          email: email,
          password: password,
          isUser: isUser
        }
      };

      //console.log("email:" + email + " pass:" + password);

      let response = await fetch(url + "/api/Login", options);
      let data = await response.json();
      //console.log("token:" + data.token);
      // For now, while server is not set, use email as value for user token
      // await AsyncStorage.setItem("userToken", JSON.stringify(email));
      await AsyncStorage.setItem("userToken", data["token"]);
      // Store the user type i.e. which type of user is logged in, user or SAFEwalker.
      await AsyncStorage.setItem("userType", userType);

      dispatch({
        type: "LOG_IN",
        token: JSON.stringify(email),
        userType: userType
      });

      // error status code is 404
    } catch (error) {
      console.error("Error in login(): " + error);
    }
  }

  // Handle signout
  async function signout() {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userType");

      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      throw new Error("Error in signout(): " + error);
    }
  }

  // Handle register
  async function register({
    email,
    password,
    firstName,
    lastName,
    phoneNumber
  }) {
    try {
      // Put code below for this: make register POST request to server
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber
        })
      };

      let response = await fetch(url, options);
      let data = await response.json();

      // Remove token, user is not logged in after registering
      // For now, while server is not set, use email as value for user token
      await AsyncStorage.setItem("userToken", JSON.stringify(email));
      // Store the user type i.e. which type of user is logged in, user or SAFEwalker.
      await AsyncStorage.setItem("userType", "user");

      dispatch({
        type: "LOG_IN",
        token: JSON.stringify(email),
        userType: "user"
      });
    } catch (error) {
      throw new Error("Error in register(): " + error);
    }
  }

  const authContextValue = useMemo(() => {
    return {
      isLoading: state.isLoading,
      isSignout: state.isSignout,
      userToken: state.userToken,
      userType: state.userType,
      dispatch,
      login,
      signout,
      register
    };
  }, [state]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

function authReducer(prevState, action) {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        isLoading: false,
        userToken: action.token,
        userType: action.userType
      };
    case "LOG_IN":
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
        userType: action.userType
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        userType: null
      };
    default: {
      throw new Error(`Unhandled auth action type: ${action.type}`);
    }
  }
}
