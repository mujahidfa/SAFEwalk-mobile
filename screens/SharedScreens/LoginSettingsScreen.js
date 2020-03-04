import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function LoginSettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Login Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
