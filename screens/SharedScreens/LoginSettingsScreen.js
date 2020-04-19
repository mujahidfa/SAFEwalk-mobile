import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Constants
import url from "./../../constants/api";
import colors from "./../../constants/colors";
import TextInput from "./../../components/TextInput";
import Button from "./../../components/Button";
import style from "./../../constants/style";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { BorderlessButton } from "react-native-gesture-handler";

export default function LoginSettingsScreen({ navigation }) {
  const { userToken, email, userType } = useContext(AuthContext);

  // forms input handling
  const { register, setValue, handleSubmit, errors, watch } = useForm();

  // password input upon change
  useEffect(() => {
    register("currentPassword");
    register("password");
    register("confirmPassword");
  }, [register]);

  // upon clicking update password button
  const saveProfileInfo = async (data) => {
    // first check old password
    let isUser = true;
    if (userType === "safewalker") {
      isUser = false;
    }
    let endpoint = "/api/Login/";
    let oldPass = 0;

    // checking old password with database
    const response1 = await fetch(url + endpoint + email + "/PasswordVerify", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        password: data.currentPassword,
        isUser: isUser,
      },
    }).then((response1) => {
      if (!(response1.status === 200)) {
        oldPass = 0;
        console.log("captured " + response1.status + "! Try again.");
      } else {
        // only updates to 1 if password is correct
        oldPass = 1;
      }
    });

    endpoint = "/api/Users/";
    if (userType == "safewalker") {
      endpoint = "/api/Safewalkers/";
    }

    if (oldPass == 1) {
      // send new info to the database
      const response = await fetch(url + endpoint + email, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          token: userToken,
        },
        body: JSON.stringify({
          Password: data.confirmPassword,
        }),
      })
        .then((response) => {
          if (!(response.status === 200)) {
            console.log("captured " + response.status + "! Try again.");
          } else {
            console.log("updated password" + data.confirmPassword);
            Alert.alert("Password Successfully Updated", "", [{ text: "OK" }], {
              cancelable: false,
            });
          }
        })
        .catch((error) => {
          console.log(error.message);
          console.log("Error in updating password. Please try again.");
        });
    } else {
      Alert.alert(
        "Incorrect Password",
        "Please Confirm Password",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  // upon pressing the update password button
  const onSubmit = (data) => {
    const response = saveProfileInfo(data);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <SafeAreaView style={styles.container2}>
          {/* Top View */}
          <View style={styles.containerTop}>
            <Text style={styles.textTitle}> Update Password:</Text>
          </View>

          {/* Inner View */}
          <KeyboardAvoidingView style={styles.innerContainer}>
            {errors.currentPassword && (
              <Text style={styles.textError}>
                Current password is required.
              </Text>
            )}
            <TextInput
              label="Current Password"
              placeholder="Current Password"
              ref={register({ name: "currentPassword" }, { required: true })}
              onChangeText={(text) => setValue("currentPassword", text, true)}
              secureTextEntry
              style={styles.textInput}
            />

            {errors.password && (
              <Text style={styles.textError}>Password is required.</Text>
            )}
            <TextInput
              label="New Password"
              placeholder="New Password"
              ref={register({ name: "password" }, { required: true })}
              onChangeText={(text) => setValue("password", text, true)}
              secureTextEntry
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
                    value === watch("password") ||
                    "The passwords do not match.",
                }
              )}
              onChangeText={(text) => setValue("confirmPassword", text, true)}
              secureTextEntry
              style={styles.textInput}
            />

            {/* Bottom */}
            <View style={styles.containerButton}>
              <Button
                title="Confirm Password Change"
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container2: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
    marginVertical: hp("6%"),
  },
  containerTop: {
    height: hp("10%"),
    justifyContent: "space-around",
    fontSize: wp("4%"),
  },
  containerButton: {
    height: hp("10%"),
    justifyContent: "space-around",
  },
  innerContainer: {
    justifyContent: "space-around",
    height: hp("40%"),
  },
  textError: {
    color: colors.red,
    alignSelf: "center",
    fontSize: wp("4%"),
  },
  textTitle: {
    color: colors.orange,
    fontSize: style.fontSize,
    fontWeight: "bold",
  },
  textInput: {
    marginBottom: 20,
  },
});
