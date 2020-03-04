import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function CredentialsSignupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Sign up 1: Credentials Screen</Text>
      <Button
        title="Next"
        onPress={() => navigation.navigate("PersonalInfo")}
      />
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
