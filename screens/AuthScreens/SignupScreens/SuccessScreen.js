import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function SuccessSignupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Sign up 3: Success Screen</Text>
      <Button title="Finish" onPress={() => navigation.navigate("Success")} />
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
