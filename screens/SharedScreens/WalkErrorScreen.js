import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { Text } from "react-native-elements";

import { AuthContext } from "../../contexts/AuthProvider";

export default function WalkErrorScreen(props) {
  const { userType, signout } = useContext(AuthContext);
  function handlePress() {
    signout();
  }
  return (
    <View style={styles.container}>
      <View>
        {/* If userType is neither "user" nor "safewalker", there's something wrong */}
        <Text h1>Error</Text>
        <Text h3>userType is neither "user" nor "safewalker" in</Text>
        <Text h3>{props.filename}</Text>
        <Text h3>userType value:"{userType}"</Text>
        <Text h2>Please sign out.</Text>
        <Button title="Sign out" onPress={() => handlePress()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
