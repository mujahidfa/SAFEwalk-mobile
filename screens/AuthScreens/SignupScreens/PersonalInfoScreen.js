import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function PersonalInfoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Sign up 2: Personal Info Screen</Text>
      <Button title="Next" onPress={() => navigation.navigate("Success")} />
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
