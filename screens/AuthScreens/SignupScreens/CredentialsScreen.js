import React, { useState, useEffect } from "react";
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

export default function CredentialsSignupScreen({ navigation }) {
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
  const { register, setValue, handleSubmit, errors, watch } = useForm();

  // update email and password input upon change
  useEffect(() => {
    register("email");
    register("password");
    register("confirmPassword");
  }, [register]);

  // upon pressing the submit button
  const onSubmit = (formData) => {
    // check if email is taken. just check, do not create an account yet.
    fetch(url + "/api/Login/" + formData.email, { method: "GET" })
      .then((response) => {
        console.log(JSON.stringify(response.status));
        setIsLoading(false);

        if (response.status && response.status === 200) {
          console.log("Email available!");

          // if email not taken, go to next screen
          navigation.navigate("PersonalInfo", {
            email: formData.email,
            password: formData.password,
          });
        } else if (response.status && response.status === 409) {
          console.log("captured 409! User not available.");
          setIsUserNotAvailable(true);
        } else {
          console.log("Unknown error" + response.status + " Try again");
          setIsLoginError(true);
        }
      })
      .catch((error) => {
        console.log("Error: " + error);
        setIsLoginError(true);
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          {/* Progress animation */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircleContainer}>
              <View
                style={[styles.progressCircle, styles.progressCurrentCircle]}
              >
                <Text style={styles.progressCircleText}>1</Text>
              </View>
              <Text style={styles.progressDescription}>Credentials</Text>
            </View>

            <View style={[styles.progressLine, { marginRight: 3 }]} />

            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>2</Text>
              </View>
              <Text style={styles.progressDescription}>Basic Info</Text>
            </View>

            <View
              style={[styles.progressLine, { marginLeft: 5, marginRight: 10 }]}
            />

            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>3</Text>
              </View>
              <Text style={styles.progressDescription}>Finish</Text>
            </View>
          </View>

          {/* Input fields */}
          <View>
            <View style={styles.inputContainer}>
              {errors.email && (
                <ErrorText>wisc.edu email is required.</ErrorText>
              )}
              {isLoginError && (
                <ErrorText>There was an error. Please try again.</ErrorText>
              )}
              {isUserNotAvailable && (
                <ErrorText>Email is taken. Use a different email.</ErrorText>
              )}
              <TextInput
                label="Email"
                placeholder="netid@wisc.edu"
                ref={register(
                  { name: "email" },
                  { required: true, pattern: /^[A-Z0-9._%+-]+@wisc\.edu$/i }
                )}
                onChangeText={(text) => setValue("email", text, true)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              {errors.password && <ErrorText>Password is required.</ErrorText>}
              <TextInput
                label="Password"
                placeholder="Password"
                ref={register({ name: "password" }, { required: true })}
                onChangeText={(text) => setValue("password", text, true)}
                mode="outlined"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              {errors.confirmPassword && (
                <ErrorText>The passwords do not match.</ErrorText>
              )}
              <TextInput
                label="Confirm password"
                ref={register(
                  { name: "confirmPassword" },
                  {
                    required: true,
                    validate: (value) =>
                      value === watch("password") ||
                      "The passwords do not match.",
                  }
                )}
                onChangeText={(text) => setValue("confirmPassword", text, true)}
                mode="outlined"
                secureTextEntry
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Spacer />
            <Button
              title="Next"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleSubmit(onSubmit)}
            />
            <Spacer />
            <Or />
            <Spacer />
            <Footer
              type="register"
              onPress={() =>
                navigation.dangerouslyGetParent().replace("UserLogin")
              }
            />
            <Spacer />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    borderColor: colors.lightgray,
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 3,
  },
  progressCurrentCircle: {
    borderColor: colors.darkorange,
  },
  progressCircleText: {
    // textAlign: "center"
  },
  progressDescription: {
    marginTop: 10,
  },
  progressLine: {
    borderWidth: 1,
    borderColor: colors.lightgray,
    width: 40,
    marginBottom: 20,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
    justifyContent: "space-between",
  },
  inputContainer: {
    height: hp("9.5%"),
    justifyContent: "flex-end",
  },
  footerContainer: {
    // marginHorizontal: style.marginContainerHorizontal,
  },
});
