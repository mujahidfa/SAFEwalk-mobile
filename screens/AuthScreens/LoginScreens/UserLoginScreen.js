import React, { useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import UWLogo from "./../../../components/UWLogo";
import SAFEWalkLogo from "./../../../components/SAFEWalkLogo";
import TextInput from "./../../../components/TextInput";
import Button from "./../../../components/Button";

import colors from "./../../../constants/colors";
import url from "./../../../constants/api";
import style from "./../../../constants/style";

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
  const onSubmit = (formData) => {
    setIsLoading(true);

    fetch(url + "/api/Login", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        email: formData.email,
        password: formData.password,
        isUser: true, // since this is user login, then isUser has to be true
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);

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
          // console.log("data in else: " + data);
          // console.log("email: " + formData.email);
          login("user", data, formData.email);
        }
      })
      .catch((error) => {
        console.log("Error in login(): " + error);
        setIsLoginError(true);
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <UWLogo />

        <KeyboardAvoidingView style={styles.innerContainer}>
          <SAFEWalkLogo />

          <View style={styles.inputContainer}>
            {errors.email && (
              <Text style={style.textError}>wisc.edu email is required.</Text>
            )}
            <TextInput
              label="Email"
              placeholder="netid@wisc.edu"
              ref={register(
                { name: "email" },
                { required: true, pattern: /^\S+@wisc\.edu$/i }
              )}
              onChangeText={(text) => setValue("email", text, true)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            {errors.password && (
              <Text style={style.textError}>Password is required.</Text>
            )}
            <TextInput
              label="Password"
              placeholder="Password"
              ref={register({ name: "password" }, { required: true })}
              onChangeText={(text) => setValue("password", text, true)}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.buttonContainer}>
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
            <Button
              title="Login as User"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
            <Button
              title="Don't have an account? Sign Up"
              onPress={() => navigation.replace("SignupStack")}
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
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
    justifyContent: "center",
  },
  inputContainer: {
    height: hp("9.5%"),
    justifyContent: "flex-end",
  },
  buttonContainer: {
    height: hp("17%"),
    justifyContent: "space-around",
  },
  textErrorAPICall: {
    color: colors.red,
    alignSelf: "center",
    fontSize: wp("4%"),
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    // marginBottom: 30,
    // marginLeft: 50,
  },
  footerPrompt: {
    fontSize: style.fontSize, //20
  },
  footerClickable: {
    fontSize: 20,
    color: colors.darkred,
    fontWeight: "bold",
  },
});
