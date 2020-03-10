import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Button, Image } from "react-native-elements";

import colors from "./../../../constants/colors";

import { AuthContext } from "./../../../contexts/AuthProvider";

export default function SuccessSignupScreen({ route }) {
  const { register } = useContext(AuthContext);

  function handleLogin() {
    register({
      email: route.params.email,
      password: route.params.password,
      firstName: route.params.firstName,
      lastName: route.params.lastName,
      phoneNumber: route.params.phoneNumber
    });
  }

  return (
    <View style={styles.container}>
      {/* Progress animation */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>✓</Text>
          </View>
          <Text style={styles.progressDescription}>Credentials</Text>
        </View>

        <View style={[styles.progressLine, { marginRight: 3 }]} />

        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>✓</Text>
          </View>
          <Text style={styles.progressDescription}>Basic Info</Text>
        </View>

        <View
          style={[styles.progressLine, { marginLeft: 5, marginRight: 10 }]}
        />

        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>✓</Text>
          </View>
          <Text style={styles.progressDescription}>Finish</Text>
        </View>
      </View>

      <Text style={styles.textSuccess}>Success!</Text>
      <Image
        source={require("./../../../assets/signup-success.jpg")}
        style={styles.image}
        PlaceholderContent={<ActivityIndicator />}
      />

      <Button
        title="Login"
        onPress={() => handleLogin()}
        buttonStyle={styles.buttonLogin}
        titleStyle={styles.buttonLoginText}
      />
    </View>
  );
}

{
  /* <View style={styles.container}>
      <Text>Sign up 3: Success Screen</Text>
      <Text>Email: {route.params.email}</Text>
      <Text>Password: {route.params.password}</Text>
      <Text>Email: {route.params.firstname}</Text>
      <Text>Password: {route.params.lastname}</Text>
      <Text>Email: {route.params.phoneNumber}</Text>
      <Button
        title="Finish"
        onPress={() =>
          login("user", {
            email: route.params.email,
            password: route.params.password
          })
        }
      />
    </View> */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    backgroundColor: colors.white
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50
  },
  progressCircleContainer: {
    alignItems: "center"
  },
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.red,
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1
  },
  progressCurrentCircle: {
    borderColor: colors.red
  },
  progressCircleText: {
    color: colors.red
  },
  progressDescription: {
    marginTop: 10
  },
  progressLine: {
    borderWidth: 1,
    borderColor: colors.red,
    width: 40,
    marginBottom: 20
  },
  textSuccess: {
    alignSelf: "center",
    fontSize: 40,
    marginTop: 40,
    marginBottom: 30
  },
  image: {
    height: 300
  },
  buttonLogin: {
    marginHorizontal: 40,
    marginTop: 40,
    height: 50,
    backgroundColor: colors.red
  },
  buttonLoginText: {
    fontSize: 17
  }
});
