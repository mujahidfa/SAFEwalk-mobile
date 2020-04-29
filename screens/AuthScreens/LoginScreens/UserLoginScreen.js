import React, { useState, useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

// Libraries
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Custom components
import SAFEwalkLogo from "../../../components/SAFEwalkLogo";
import ErrorText from "./../../../components/ErrorText";
import TextInput from "./../../../components/TextInput";
import Button from "./../../../components/Button";
import Or from "../../../components/Or";
import Footer from "../../../components/AuthScreenFooter";
import Spacer from "../../../components/Spacer";

// Constants
import colors from "./../../../constants/colors";
import url from "./../../../constants/api";
import style from "./../../../constants/style";

// Contexts
import { AuthContext } from "./../../../contexts/AuthProvider";

export default function UserLoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [isLoginError, setIsLoginError] = useState(false);
  const [isUserNotAvailable, setIsUserNotAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // hide API error after 5 seconds
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
        <KeyboardAvoidingView
          behavior={Platform.Os == "ios" ? "padding" : "height"}
          style={styles.innerKeyboardViewContainer}
        >
          <View>
            <SAFEwalkLogo />
          </View>
          <View>
            <Text style={styles.titleLogin}>User Login</Text>
            <View style={styles.inputContainer}>
              {errors.email && (
                <ErrorText>wisc.edu email is required.</ErrorText>
              )}
              {isUserNotAvailable && (
                <ErrorText>Invalid email or password.</ErrorText>
              )}
              {isLoginError && (
                <ErrorText>There was an error. Please try again.</ErrorText>
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
              {errors.password && <ErrorText>Password is required.</ErrorText>}
              {isUserNotAvailable && (
                <ErrorText>Invalid email or password.</ErrorText>
              )}
              <TextInput
                label="Password"
                placeholder="Password"
                ref={register({ name: "password" }, { required: true })}
                onChangeText={(text) => setValue("password", text, true)}
                secureTextEntry
              />
            </View>
            <Spacer />
            <Button
              title="Login"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </KeyboardAvoidingView>

        <View style={styles.innerFooterContainer}>
          <Footer
            type="signup"
            onPress={() => navigation.replace("SignupStack")}
          />
          <Spacer padding={{ paddingVertical: hp("1%") }} />
          <Or />
          <Spacer padding={{ paddingVertical: hp("1%") }} />
          <Button
            title="Login as SAFEwalker"
            onPress={() => navigation.replace("SafewalkerLogin")}
            type="outline"
          />
          <Spacer />
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
  innerKeyboardViewContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
    justifyContent: "space-evenly",
  },
  innerFooterContainer: {
    marginHorizontal: style.marginContainerHorizontal,
  },
  titleLogin: {
    fontSize: wp("5.5%"),
    fontWeight: "bold",
    textAlign: "center",
    color: colors.gray,
  },
  inputContainer: {
    height: hp("9.5%"),
    justifyContent: "flex-end",
  },
});
