import React, { useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Button, Image } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";

import colors from "./../../../constants/colors";
import url from "./../../../constants/api";

import { AuthContext } from "./../../../contexts/AuthProvider";
import { useState } from "react";

export default function UserLoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [isLoginError, setIsLoginError] = useState(false);
  const [isUserNotAvailable, setIsUserNotAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // hide error after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoginError(false);
      setIsUserNotAvailable(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoginError, isUserNotAvailable]);

  // forms input handling
  const { register, setValue, handleSubmit, errors } = useForm();

  // update email and password input upon change
  useEffect(() => {
    register("email");
    register("password");
  }, [register]);

  // upon pressing the submit button
  const onSubmit = formData => {
    setIsLoading(true);

    fetch(url + "/api/Login", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        email: formData.email,
        password: formData.password,
        isUser: true // since this is user login, then isUser has to be true
      }
    })
      .then(response => response.json())
      .then(data => {
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
          console.log("email: " + formData.email);
          login("user", data, formData.email);
        }
      })
      .catch(error => {
        console.log("Error in login(): " + error);
        setIsLoginError(true);
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoUWContainer}>
          <Image
            source={require("./../../../assets/uw-transportation-logo.png")}
            style={styles.logoUW}
          />
        </View>

        <KeyboardAvoidingView style={styles.innerContainer}>
          <View style={styles.logoSAFEwalkContainer}>
            <Text style={styles.logoSAFE}>SAFE</Text>
            <Text style={styles.logoWALK}>walk</Text>
          </View>

          {errors.email && (
            <Text style={styles.textError}>wisc.edu email is required.</Text>
          )}
          <TextInput
            label="Email"
            placeholder="netid@wisc.edu"
            ref={register(
              { name: "email" },
              { required: true, pattern: /^\S+@wisc\.edu$/i }
            )}
            onChangeText={text => setValue("email", text, true)}
            mode="outlined"
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />

          {errors.password && (
            <Text style={styles.textError}>Password is required.</Text>
          )}
          <TextInput
            label="Password"
            placeholder="Password"
            ref={register({ name: "password" }, { required: true })}
            onChangeText={text => setValue("password", text, true)}
            mode="outlined"
            secureTextEntry
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />

          {isLoginError && (
            <Text style={styles.textErrorAPICall}>
              There was an error. Please try again.
            </Text>
          )}
          {isUserNotAvailable && (
            <Text style={styles.textErrorAPICall}>
              Invalid email or password.
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleSubmit(onSubmit)}
              buttonStyle={styles.buttonLogin}
              titleStyle={styles.buttonLoginText}
            />

            <Button
              title="Don't have an account? Sign Up"
              onPress={() => navigation.replace("SignupStack")}
              buttonStyle={styles.buttonSignup}
              titleStyle={styles.buttonSignupText}
              containerStyle={styles.buttonSignupContainer}
              type="outline"
            />
          </View>
        </KeyboardAvoidingView>
        <View style={styles.footerContainer}>
          <Text style={styles.footerPrompt}>Login as a SAFEwalker?</Text>
          <TouchableOpacity
            onPress={() => navigation.replace("SafewalkerLogin")}
          >
            <Text style={styles.footerClickable}>Click here.</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  logoUWContainer: {
    alignItems: "center"
  },
  logoUW: {
    width: 333,
    height: 40,
    alignSelf: "center"
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: "center"
  },
  logoSAFEwalkContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 50
  },
  logoSAFE: {
    fontWeight: "bold",
    fontSize: 75,
    color: colors.orange
  },
  logoWALK: {
    fontStyle: "italic",
    fontSize: 75,
    color: colors.orange
  },
  textError: {
    color: colors.red
  },
  textInput: {
    marginBottom: 20
  },
  buttonContainer: {
    marginTop: 50
  },
  buttonLogin: {
    marginBottom: 20,
    height: 60,
    borderRadius: 50,
    backgroundColor: colors.red
  },
  buttonSignup: {
    marginBottom: 20,
    height: 60,
    borderRadius: 50,
    borderColor: colors.red
  },
  buttonLoginText: {
    fontSize: 17
  },
  buttonSignupText: {
    fontSize: 17,
    color: colors.red
  },
  textErrorAPICall: {
    color: colors.red,
    alignSelf: "center",
    fontSize: 18
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    marginBottom: 30,
    marginLeft: 50
  },
  footerPrompt: { fontSize: 20 },
  footerClickable: {
    fontSize: 20,
    color: colors.darkred,
    fontWeight: "bold"
  }
});
