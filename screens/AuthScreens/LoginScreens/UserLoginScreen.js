import React, { useState, useContext } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";

import { AuthContext } from "./../../../contexts/AuthProvider";

export default function UserLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>User login Screen</Text>

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
        onPress={() => login("user", { email, password })}
      />

      <Button
        title="Go to SAFEwalker login"
        onPress={() => navigation.replace("SafewalkerLogin")}
      />

      <Button
        title="Signup"
        onPress={() => navigation.navigate("SignupStack")}
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
