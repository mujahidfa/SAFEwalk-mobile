import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Button } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { useForm } from "react-hook-form";

import colors from "./../../../constants/colors";
import url from "./../../../constants/api";

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
      <View style={styles.container}>
        {/* Progress animation */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, styles.progressCurrentCircle]}>
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

        {/* Main view */}
        <KeyboardAvoidingView style={styles.innerContainer}>
          {errors.email && (
            <Text style={styles.textError}>wisc.edu email is required.</Text>
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
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {errors.password && (
            <Text style={styles.textError}>Password is required.</Text>
          )}
          <TextInput
            label="Password"
            placeholder="Password"
            ref={register({ name: "password" }, { required: true })}
            onChangeText={(text) => setValue("password", text, true)}
            mode="outlined"
            secureTextEntry
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />

          {errors.confirmPassword && (
            <Text style={styles.textError}>The passwords do not match.</Text>
          )}
          <TextInput
            label="Confirm password"
            ref={register(
              { name: "confirmPassword" },
              {
                required: true,
                validate: (value) =>
                  value === watch("password") || "The passwords do not match.",
              }
            )}
            onChangeText={(text) => setValue("confirmPassword", text, true)}
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
              Email is taken. Use a different email.
            </Text>
          )}
        </KeyboardAvoidingView>

        {/* Footer */}
        <Button
          title="Next"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit(onSubmit)}
          buttonStyle={styles.buttonNext}
          titleStyle={styles.buttonNextText}
        />
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.footerPrompt}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.dangerouslyGetParent().replace("UserLogin")
            }
          >
            <Text style={styles.footerClickable}>Sign in.</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginTop: 50,
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
    borderWidth: 1,
  },
  progressCurrentCircle: {
    borderColor: colors.red,
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
    marginHorizontal: 50,
    justifyContent: "center",
  },
  textError: {
    color: colors.red,
  },
  textInput: {
    marginBottom: 20,
  },
  textErrorAPICall: {
    color: colors.red,
    alignSelf: "center",
    fontSize: 18,
  },
  buttonNext: {
    marginHorizontal: 50,
    marginBottom: 20,
    height: 50,
    backgroundColor: colors.red,
  },
  buttonNextText: {
    fontSize: 17,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  orText: {
    fontSize: 20,
    color: colors.lightgray,
    marginHorizontal: 20,
  },
  orLine: {
    borderWidth: 1,
    borderColor: colors.lightgray,
    width: 100,
  },
  footerContainer: {
    marginBottom: 50,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerPrompt: { fontSize: 20 },
  footerClickable: {
    fontSize: 20,
    color: colors.darkred,
    fontWeight: "bold",
  },
});
