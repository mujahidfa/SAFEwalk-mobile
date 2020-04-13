import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
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
  const onSubmit = (formData) => {
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      }),
    })
      .then((response) => {
        console.log(JSON.stringify(response.status));
        setIsLoading(false);

        if (response.status && response.status === 200) {
          console.log("Email available!");

          // if email not taken, go to next screen
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Success",
                params: { email: email, password: password },
              },
            ],
          });
        } else if (response.status && response.status === 409) {
          console.log("captured 409! Cannot use existing account.");
          setIsUserNotAvailable(true);
        } else {
          console.log("Unknown error" + response.status + " Try again");
          setIsSignupError(true);
        }
      })
      .catch((error) => {
        console.log("Error in login(): " + error);
        setIsSignupError(true);
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.Os == "ios" ? "padding" : "height"}
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

            <View
              style={[
                styles.progressLine,
                styles.progressCurrentCircle,
                { marginRight: 3 },
              ]}
            />

            <View style={styles.progressCircleContainer}>
              <View
                style={[styles.progressCircle, styles.progressCurrentCircle]}
              >
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
              {errors.firstName && (
                <ErrorText>First name is required.</ErrorText>
              )}
              {isSignupError && (
                <ErrorText>There was an error. Please try again.</ErrorText>
              )}
              <TextInput
                label="First Name"
                ref={register({ name: "firstName" }, { required: true })}
                onChangeText={(text) => setValue("firstName", text, true)}
                mode="outlined"
              />
            </View>

            <View style={styles.inputContainer}>
              {errors.lastName && <ErrorText>Last name is required.</ErrorText>}
              <TextInput
                label="Last Name"
                ref={register({ name: "lastName" }, { required: true })}
                onChangeText={(text) => setValue("lastName", text, true)}
                mode="outlined"
              />
            </View>

            <View style={styles.inputContainer}>
              {errors.phoneNumber && (
                <ErrorText>Valid US phone number is required.</ErrorText>
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
                    pattern: /^[0-9]+$/,
                  }
                )}
                onChangeText={(text) => setValue("phoneNumber", text, true)}
                mode="outlined"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Spacer />
            <Button
              title="Create Account"
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
