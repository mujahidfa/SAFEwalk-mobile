import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, AsyncStorage } from "react-native";
import { Button } from "react-native-elements";

// Constants
import colors from "../../constants/colors";
import socket from "../../contexts/socket";

// Contexts
import { AuthContext } from "../../contexts/AuthProvider";
import { WalkContext } from "../../contexts/WalkProvider";

export default function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, email } = useContext(AuthContext);
  const { walkId, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  useEffect(() => {
    console.log("In SafewalkerMapScreen:");
    console.log("walkId:" + walkId);
    console.log("userSocketId:" + userSocketId);
  }, [walkId, userSocketId]);

  useEffect(() => {
    // socket to listen to user status change
    socket.on("user walk status", (status) => {
      console.log("user walk status in SWMapScreen:" + status);

      switch (status) {
        case -2:
          resetWalkContextState();
          // navigation.reset({
          //   index: 0,
          //   routes: [
          //     {
          //       name: "SafewalkerHome",
          //     },
          //   ],
          // });
          alert("The user canceled the walk.");
          break;
      }
    });

    return () => socket.off("user walk status", null);
  }, []);

  async function handleSubmit() {
    // get socketId from async storage
    // const userSocketId = await AsyncStorage.getItem("userSocketId");
    if (userSocketId) {
      // Let user know walk has been completed
      socket.emit("walker walk status", { userId: userSocketId, status: 2 }); // send notification to user
    }

    // const walkId = await AsyncStorage.getItem("walkId");
    // putWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + walkId,
      {
        method: "PUT",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: 2,
        }),
      }
    );

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("finish walk failed: status " + status);
      return;
    }

    resetWalkContextState();
    // navigation.reset({
    //   index: 0,
    //   routes: [
    //     {
    //       name: "SafewalkerHome",
    //     },
    //   ],
    // });
  }

  return (
    <View style={styles.container}>
      <Text>SAFEwalker Map Screen</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="SAFEwalk Completed"
          loading={isLoading}
          disabled={isLoading}
          onPress={() => handleSubmit()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 50,
    backgroundColor: "#77b01a",
    // position: "absolute",
    // bottom: 0
  },
  buttonText: {
    fontSize: 20,
  },
});
