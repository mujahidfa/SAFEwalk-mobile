import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function UserProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>User Profile Screen</Text>
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
