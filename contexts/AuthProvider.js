import React, { createContext, useReducer, useMemo } from "react";
import { AsyncStorage } from "react-native";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    // initial states
    isLoading: true,
    isSignout: false,
    userToken: null,
    userType: "user",
    userEmail: null
  });

  // Handle Login
  async function login(userType, userToken, email) {
    try {
      // Store user token
      await AsyncStorage.setItem("userToken", userToken);
      // Store the user type i.e. which type of user is logged in, user or SAFEwalker.
      await AsyncStorage.setItem("userType", userType);
      // Store the user email
      await AsyncStorage.setItem("userEmail", email);

      dispatch({
        type: "LOG_IN",
        token: userToken,
        userType: userType,
        userEmail: email
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
      await AsyncStorage.removeItem("userEmail");

      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      console.error("Error in signout(): " + error);
    }
  }

  const authContextValue = useMemo(() => {
    return {
      isLoading: state.isLoading,
      isSignout: state.isSignout,
      userToken: state.userToken,
      userType: state.userType,
      userEmail: state.userEmail,
      dispatch,
      login,
      signout
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
        userType: action.userType,
        userEmail: action.userEmail
      };
    case "LOG_IN":
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
        userType: action.userType,
        userEmail: action.userEmail
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        userType: null,
        userEmail: null
      };
    default: {
      console.error(`Unhandled auth action type: ${action.type}`);
    }
  }
}
