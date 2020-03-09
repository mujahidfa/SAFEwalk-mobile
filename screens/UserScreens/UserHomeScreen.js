import React, { useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";

import { AuthContext } from "./../../contexts/AuthProvider";

export default function UserHomeScreen({ navigation }) {
  const { signout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>User Home Screen</Text>
      <Button
        title="Go to User Tabs"
        onPress={() => navigation.replace("UserTab")}
      />
      <Button title="Log Out" onPress={() => signout()} />
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
