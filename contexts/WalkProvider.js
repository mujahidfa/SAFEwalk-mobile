import React, { createContext, useReducer, useMemo } from "react";
import { AsyncStorage } from "react-native";

export const WalkContext = createContext();

export function WalkProvider({ children }) {
  const [state, dispatch] = useReducer(walkReducer, {
    // initial states
    isWalkLoading: true,
    isWalkActive: "false", // has to be a string due to AsyncStorage constraints (cannot store boolean)

    // initial walk states
    walkId: null,
    startLat: null,
    startLng: null,
    destLat: null,
    destLng: null,

    // initial user state
    userEmail: null,
    walkerEmail: null,

    // initial SAFEwalker state
    userSocketId: null,
    walkerSocketId: null,
  });

  // Set up walk ID
  async function setWalkAsActive() {
    try {
      // Store walk ID
      await AsyncStorage.setItem("isWalkActive", "true");

      dispatch({
        type: "SET_WALK_ACTIVE",
        isWalkActive: "true",
      });
    } catch (error) {
      console.error("Error in setIsWalkActive(): " + error);
    }
  }

  // Set up walk ID
  async function setWalkId(walkId) {
    try {
      // Store walk ID
      await AsyncStorage.setItem("walkId", walkId);

      dispatch({
        type: "SET_WALK_ID",
        walkId: walkId,
      });
    } catch (error) {
      console.error("Error in setWalkId(): " + error);
    }
  }

  // Remove walk ID
  async function removeWalkId() {
    try {
      // remove walk ID
      await AsyncStorage.removeItem("WalkId");

      dispatch({ type: "REMOVE_WALK_ID" });
    } catch (error) {
      console.error("Error in removeWalkId(): " + error);
    }
  }

  // Store Coordinates (startLat, startLng, destLat, destLng)
  async function setCoordinates(startLat, startLng, destLat, destLng) {
    try {
      await AsyncStorage.setItem("startLat", startLat);
      await AsyncStorage.setItem("startLng", startLng);
      await AsyncStorage.setItem("destLat", destLat);
      await AsyncStorage.setItem("destLng", destLng);

      dispatch({
        type: "SET_COORDINATES",
        startLat: startLat,
        startLng: startLng,
        destLat: destLat,
        destLng: destLng,
      });
    } catch (error) {
      console.error("Error in setCoordinates(): " + error);
    }
  }

  // Store User information (walkId, email and socket ID)
  async function setUserInfo(walkId, userEmail, userSocketId) {
    try {
      await AsyncStorage.setItem("walkId", walkId);
      await AsyncStorage.setItem("userEmail", userEmail);
      await AsyncStorage.setItem("userSocketId", userSocketId);

      dispatch({
        type: "SET_USER_INFO",
        walkId: walkId,
        userEmail: userEmail,
        userSocketId: userSocketId,
      });
    } catch (error) {
      console.error("Error in seUserInfo(): " + error);
    }
  }

  // Store Safewalker information (email and socket ID)
  async function setWalkerInfo(walkerEmail, walkerSocketId) {
    try {
      await AsyncStorage.setItem("walkerEmail", walkerEmail);
      await AsyncStorage.setItem("walkerSocketId", walkerSocketId);

      dispatch({
        type: "SET_WALKER_INFO",
        walkerEmail: walkerEmail,
        walkerSocketId: walkerSocketId,
      });
    } catch (error) {
      console.error("Error in setWalkerInfo(): " + error);
    }
  }

  // remove all current walk-related information
  async function resetWalkContextState() {
    try {
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("userSocketId");
      await AsyncStorage.removeItem("walkerEmail");
      await AsyncStorage.removeItem("walkerSocketId");

      await AsyncStorage.removeItem("walkId");
      await AsyncStorage.removeItem("startLat");
      await AsyncStorage.removeItem("startLng");
      await AsyncStorage.removeItem("destLat");
      await AsyncStorage.removeItem("destLng");

      dispatch({ type: "RESET" });
    } catch (error) {
      console.error("Error in resetContextState(): " + error);
    }
  }

  const walkContextValue = useMemo(() => {
    return {
      // states
      isWalkLoading: state.isWalkLoading,
      isWalkActive: state.isWalkActive,
      userEmail: state.userEmail,
      walkerEmail: state.walkerEmail,
      userSocketId: state.userSocketId,
      walkerSocketId: state.walkerSocketId,
      walkId: state.walkId,
      startLat: state.startLat,
      startLng: state.startLng,
      destLat: state.destLat,
      destLng: state.destLng,

      // functions
      setWalkAsActive,
      setWalkId,
      removeWalkId,
      setCoordinates,
      setUserInfo,
      setWalkerInfo,
      resetWalkContextState,
      dispatch,
    };
  }, [state]);

  return (
    <WalkContext.Provider value={walkContextValue}>
      {children}
    </WalkContext.Provider>
  );
}

function walkReducer(prevState, action) {
  switch (action.type) {
    case "RESTORE_STATE":
      return {
        ...prevState,
        isWalkLoading: false,
        isWalkActive: action.isWalkActive,
        userEmail: action.userEmail,
        walkerEmail: action.walkerEmail,
        userSocketId: action.userSocketId,
        walkerSocketId: action.walkerSocketId,
        walkId: action.walkId,
        startLat: action.startLat,
        startLng: action.startLng,
        destLat: action.destLat,
        destLng: action.destLng,
      };
    case "SET_WALK_ACTIVE":
      return {
        ...prevState,
        isWalkActive: "true",
      };
    case "SET_WALK_ID":
      return {
        ...prevState,
        walkId: action.walkId,
      };
    case "REMOVE_WALK_ID":
      return {
        ...prevState,
        walkId: null,
      };
    case "SET_COORDINATES":
      return {
        ...prevState,
        startLat: action.startLat,
        startLng: action.startLng,
        destLat: action.destLat,
        destLng: action.destLng,
      };
    case "SET_USER_INFO":
      return {
        ...prevState,
        userEmail: action.userEmail,
        userSocketId: action.userSocketId,
        walkId: action.walkId,
      };
    case "SET_WALKER_INFO":
      return {
        ...prevState,
        walkerEmail: action.walkerEmail,
        walkerSocketId: action.walkerSocketId,
      };
    case "RESET":
      return {
        ...prevState,
        isWalkLoading: false,
        isWalkActive: "false",
        userEmail: null,
        userSocketId: null,
        walkerEmail: null,
        walkerSocketId: null,
        walkId: null,
        startLat: null,
        startLng: null,
        destLat: null,
        destLng: null,
      };

    default: {
      console.error(`Unhandled walk action type: ${action.type}`);
    }
  }
}
