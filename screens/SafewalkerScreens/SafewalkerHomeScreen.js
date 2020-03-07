import React, { useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";

import { AuthContext } from "./../../contexts/AuthProvider";

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>SAFEwalker Home Screen duhhh</Text>
      <Button
        title="Go to SAFEwalker Tabs"
        onPress={() => navigation.navigate("SafewalkerTab")}
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
