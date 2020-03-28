import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "react-native-elements";

import colors from "./../../constants/colors";

export default function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit() {
    console.log("finish button is pressed!");
  }

  return (
    <View style={styles.container}>
      <Text>SAFEwalker Map Screen</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Mark as completed!"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit()}
          buttonStyle={styles.buttonLogin}
          titleStyle={styles.buttonLoginText}
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
    paddingHorizontal: 60
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 40
  },
  buttonLogin: {
    height: 60,
    borderRadius: 50,
    backgroundColor: colors.red
    // position: "absolute",
    // bottom: 0
  },
  buttonLoginText: {
    fontSize: 20
  }
});
