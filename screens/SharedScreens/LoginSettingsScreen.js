import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import { Button, Image, Avatar, Input, Divider } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { useForm } from "react-hook-form";
import { AuthContext } from "./../../contexts/AuthProvider";

import url from "./../../constants/api";
import colors from "./../../constants/colors";

export default function LoginSettingsScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { userToken, email } = useContext(AuthContext);

  // forms input handling
  const { register, setValue, handleSubmit, errors, watch } = useForm();

  // password input upon change
  useEffect(() => {
    //register("currentPassword");
    register("password");
    register("confirmPassword");
  }, [register]);

  // when component is mounted
  useEffect(() => {
    const response = getProfileInfo();
  }, []);

  const getProfileInfo = async () => {
    // get info from the database
    let email = await AsyncStorage.getItem("email");

    const response = await fetch(url + "/api/Users/" + email, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        email: email,
        token: userToken,
        isUser: true
      }
    }).then(response => {
      if (!(response.status === 200)) {
        console.log("captured " + response.status + "! Try again.");
      } else {
        return response.json();
      }
    });

    // set states to proper values based on backend response
    setFirstName(response.firstName);
    setLastName(response.lastName);
  };

  // upon clicking update password button
  /*
   Response codes:
   401 (unauthorized)
   200 (ok)
   */
  const saveProfileInfo = async data => {
    //await setPassword(data.confirmPassword);

    // send new info to the database
    let email = await AsyncStorage.getItem("email");

    const response = await fetch(url + "/api/Users/" + email, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        token: userToken
      },
      body: JSON.stringify({
        Password: data.confirmPassword
      })
    })
      .then(response => {
        if (!(response.status === 200)) {
          console.log("captured " + response.status + "! Try again.");
        } else {
          console.log("updated password" + data.confirmPassword);
          alert("Updated Password!");
        }
      })
      .catch(error => {
        console.log(error.message);
        console.log("Error in updating password. Please try again.");
      });
  };

  // upon pressing the update password button
  const onSubmit = data => {
    const response = saveProfileInfo(data);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.containerTop}>
          {/* TODO: Update avatar with user's name */}
          <Avatar
            rounded
            size={200}
            title={firstName + " " + lastName}
            overlayContainerStyle={{ backgroundColor: colors.orange }}
            titleStyle={{ fontSize: 20 }}
          />
        </View>

        {/* Middle View */}
        <KeyboardAvoidingView style={styles.innerContainer}>
          {/*
          {errors.currentPassword && (
            <Text style={styles.textError}>Current password is required.</Text>
          )}
          <TextInput
            label="Current Password"
            placeholder="Current Password"
            ref={register({ name: "currentPassword" }, { required: true })}
            onChangeText={text => setValue("currentPassword", text, true)}
            mode="outlined"
            secureTextEntry
            theme={{ colors: { primary: 'orange' } }}
            style={styles.textInput}
          />
          */}

          {errors.password && (
            <Text style={styles.textError}>Password is required.</Text>
          )}
          <TextInput
            label="New Password"
            placeholder="New Password"
            ref={register({ name: "password" }, { required: true })}
            onChangeText={text => setValue("password", text, true)}
            mode="outlined"
            secureTextEntry
            theme={{ colors: { primary: "orange" } }}
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
                validate: value =>
                  value === watch("password") || "The passwords do not match."
              }
            )}
            onChangeText={text => setValue("confirmPassword", text, true)}
            mode="outlined"
            secureTextEntry
            theme={{ colors: { primary: colors.orange } }}
            style={styles.textInput}
          />
        </KeyboardAvoidingView>

        {/* Bottom */}
        <View style={styles.containerBottom}>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={styles.buttonNext}
          >
            <Text style={styles.buttonNextText}> Update Password </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    flex: 0.6,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 100
  },
  containerBottom: {
    flex: 1,
    backgroundColor: "#fff"
  },
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: "center"
  },
  textError: {
    color: colors.red
  },
  textInput: {
    marginBottom: 20
  },
  buttonNext: {
    backgroundColor: colors.orange,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    marginTop: 20,
    marginHorizontal: 50
  },
  buttonNextText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center"
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center"
  }
});
