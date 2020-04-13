import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Image } from "react-native-elements";
import Button from "./../../../components/Button";
import ErrorText from "./../../../components/ErrorText";
import Spacer from "../../../components/Spacer";

// Libraries
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Constants
import colors from "./../../../constants/colors";
import url from "./../../../constants/api";
import style from "./../../../constants/style";

import { AuthContext } from "./../../../contexts/AuthProvider";

export default function SuccessSignupScreen({ route }) {
  const [isLoginError, setIsLoginError] = useState(false);
  const [isUserNotAvailable, setIsUserNotAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useContext(AuthContext);

  // hide error after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoginError(false);
      setIsUserNotAvailable(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoginError, isUserNotAvailable]);

  // upon pressing the submit button
  function handleLogin() {
    setIsLoading(true);
    console.log("email: " + route.params.email);
    console.log("password: " + route.params.password);
    fetch(url + "/api/Login", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        email: route.params.email,
        password: route.params.password,
        isUser: true, // since this is user login, then isUser has to be true
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        console.log("data: " + data);
        // The endpoint only returns a string upon success
        // and a full body response if there's an error.
        // Therefore, if data.status exists, then this means it's an error.
        if (data.status) {
          console.log("data in if: " + JSON.stringify(data));
          if (data.status === 404) {
            console.log("captured 404! User not available.");
            setIsUserNotAvailable(true);
          } else {
            console.log("Unknown error " + data.status + ". Try again");
            setIsLoginError(true);
          }
        }
        // The endpoint only returns a string upon success,
        // so because of that, if it's a success, data.status would be null.
        else {
          console.log("data in else: " + data);
          console.log("email: " + route.params.email);
          login("user", data, route.params.email);
        }
      })
      .catch((error) => {
        console.log("Error in login(): " + error);
        setIsLoginError(true);
        setIsLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Success image*/}
      <View>
        <Text style={styles.textSuccess}>Success!</Text>
        <Spacer />
        <Image
          source={require("./../../../assets/signup-success.jpg")}
          style={styles.image}
          PlaceholderContent={<ActivityIndicator />}
        />
      </View>

      {/* Button go to main screen */}
      <View style={styles.buttonContainer}>
        {isLoginError && (
          <ErrorText>
            There was an error. Please try again. (isLoginError)
          </ErrorText>
        )}
        {isUserNotAvailable && (
          <ErrorText>
            There was an error. Please try again. (isUserNotAvailable)
          </ErrorText>
        )}
        <Button
          title="Go to main screen"
          loading={isLoading}
          disabled={isLoading}
          onPress={() => handleLogin()}
        />
      </View>
      <Spacer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "space-between",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleContainer: {
    alignItems: "center",
  },
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.darkorange,
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 3,
  },
  progressCurrentCircle: {
    borderColor: colors.darkorange,
  },
  progressCircleText: {
    color: colors.darkorange,
  },
  progressDescription: {
    marginTop: 10,
  },
  progressLine: {
    borderWidth: 1,
    borderColor: colors.darkorange,
    width: 40,
    marginBottom: 20,
  },
  textSuccess: {
    alignSelf: "center",
    fontSize: hp("5%"),
  },
  image: {
    height: hp("33%"),
  },
  buttonContainer: {
    marginHorizontal: style.marginContainerHorizontal,
  },
});
