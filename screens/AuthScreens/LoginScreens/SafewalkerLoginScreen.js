import React, { useState, useContext } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";

import { AuthContext } from "./../../../contexts/AuthProvider";

export default function SafewalkerLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>Safewalker login Screen</Text>
      <TextInput
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title="Log in"
        onPress={() => login("safewalker", { email, password })}
      />

      <Button
        title="Go to User login"
        onPress={() => navigation.replace("UserLogin")}
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
