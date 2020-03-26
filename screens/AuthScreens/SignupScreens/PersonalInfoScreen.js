import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";

import { Button } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { useForm } from "react-hook-form";

import colors from "./../../../constants/colors";
import url from "./../../../constants/api";

export default function PersonalInfoScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignupError, setIsSignupError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Before anything, validate email and password values
  useEffect(() => {
    if (
      route.params.email !== null ||
      route.params.email !== undefined ||
      route.params.email !== ""
    ) {
      setEmail(route.params.email);
    } else {
      console.error("Email is empty!");
    }
    if (
      route.params.password !== null ||
      route.params.password !== undefined ||
      route.params.password !== ""
    ) {
      setPassword(route.params.password);
    } else {
      console.error("Password is empty!");
    }
  }, []);

  // hide error after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSignupError(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isSignupError]);

  // forms input handling
  const { register, setValue, handleSubmit, errors } = useForm();

  // update input upon change
  useEffect(() => {
    register("firstName");
    register("lastName");
    register("phoneNumber");
  }, [register]);

  // upon pressing the submit button
  const onSubmit = formData => {
    // navigation.navigate("Success", {
    //   email: email,
    //   password: password,
    //   firstName: formData.firstName,
    //   lastName: formData.lastName,
    //   phoneNumber: formData.phoneNumber
    // });
    setIsLoading(true);

    fetch(url + "/api/Users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      })
    })
      .then(response => {
        console.log(JSON.stringify(response.status));
        setIsLoading(false);

        if (response.status && response.status === 200) {
          console.log("Email available!");

          // if email not taken, go to next screen
          navigation.navigate("Success", {
            email: email,
            password: password
          });
        } else if (response.status && response.status === 409) {
          console.log("captured 409! Cannot use existing account.");
          setIsUserNotAvailable(true);
        } else {
          console.log("Unknown error" + response.status + " Try again");
          setIsSignupError(true);
        }
      })
      .catch(error => {
        console.log("Error in login(): " + error);
        setIsSignupError(true);
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

          <View
            style={[
              styles.progressLine,
              styles.progressCurrentCircle,
              { marginRight: 3 }
            ]}
          />

          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, styles.progressCurrentCircle]}>
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
          {errors.firstName && (
            <Text style={styles.textError}>First name is required.</Text>
          )}
          <TextInput
            label="First Name"
            ref={register({ name: "firstName" }, { required: true })}
            onChangeText={text => setValue("firstName", text, true)}
            mode="outlined"
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />

          {errors.lastName && (
            <Text style={styles.textError}>Last name is required.</Text>
          )}
          <TextInput
            label="Last Name"
            ref={register({ name: "lastName" }, { required: true })}
            onChangeText={text => setValue("lastName", text, true)}
            mode="outlined"
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />

          {errors.phoneNumber && (
            <Text style={styles.textError}>
              Valid US phone number is required.
            </Text>
          )}
          <TextInput
            label="Phone Number"
            placeholder="(608) - 123 - 4567"
            ref={register(
              { name: "phoneNumber" },
              {
                required: true,
                minLength: 10,
                maxLength: 10,
                pattern: /^[0-9]+$/
              }
            )}
            onChangeText={text => setValue("phoneNumber", text, true)}
            mode="outlined"
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
            keyboardType="phone-pad"
          />

          {isSignupError && (
            <Text style={styles.textErrorAPICall}>
              There was an error. Please try again.
            </Text>
          )}
        </KeyboardAvoidingView>

        {/* Footer */}
        <Button
          title="Create Account"
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
    borderColor: colors.lightgray,
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1
  },
  progressCurrentCircle: {
    borderColor: colors.red
  },
  progressCircleText: {
    // textAlign: "center"
  },
  progressDescription: {
    marginTop: 10
  },
  progressLine: {
    borderWidth: 1,
    borderColor: colors.lightgray,
    width: 40,
    marginBottom: 20
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: "center"
  },
  textError: {
    color: colors.red
  },
  textErrorAPICall: {
    color: colors.red,
    alignSelf: "center",
    fontSize: 18
  },
  textInput: {
    marginBottom: 20
  },
  buttonNext: {
    marginHorizontal: 50,
    marginBottom: 20,
    height: 50,
    backgroundColor: colors.red
  },
  buttonNextText: {
    fontSize: 17
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15
  },
  orText: {
    fontSize: 20,
    color: colors.lightgray,
    marginHorizontal: 20
  },
  orLine: {
    borderWidth: 1,
    borderColor: colors.lightgray,
    width: 100
  },
  footerContainer: {
    marginBottom: 50,
    flexDirection: "row",
    justifyContent: "center"
  },
  footerPrompt: { fontSize: 20 },
  footerClickable: {
    fontSize: 20,
    color: colors.darkred,
    fontWeight: "bold"
  }
});
