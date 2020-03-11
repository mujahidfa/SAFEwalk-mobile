import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { Button, Image, Avatar, Input, Divider} from "react-native-elements";
import { TextInput } from "react-native-paper";
import { useForm } from "react-hook-form";

import colors from "./../../constants/colors";

export default function LoginSettingsScreen({ navigation }) {
  // forms input handling
  const { register, setValue, handleSubmit, errors, watch } = useForm();

  // password input upon change
  useEffect(() => {
    register("currentPassword");
    register("password");
    register("confirmPassword");
  }, [register]);

  // upon pressing the update password button
  const onSubmit = data => {
    // send post request wiht updated info
    alert('Updated!');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <View style={styles.containerTop}>
        <Avatar
            rounded
            size={125}
            title={"Yoon" + " " + "Cho"}
            overlayContainerStyle={{ backgroundColor: "orange" }}
            titleStyle={{ fontSize: 20 }}
        />
      </View>

        {/* Main view */}
        <KeyboardAvoidingView style={styles.innerContainer}>

          {errors.email && (
            <Text style={styles.textError}>wisc.edu email is required.</Text>
          )}

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
            theme={{ colors: { primary: 'orange' } }}
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
            theme={{ colors: { primary: 'orange' } }}
            style={styles.textInput}
          />
        </KeyboardAvoidingView>

        {/* Footer */}
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
    flex: 0.8,
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
    justifyContent: "center",
  },
  textError: {
    color: colors.red
  },
  textInput: {
    marginBottom: 20
  },
  buttonNext: {
    backgroundColor: "orange",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    marginTop: 20,
    marginHorizontal: 50,
  },
  buttonNextText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
  },
  image: {
    width: '30%',
    height: '30%',
    resizeMode: 'center',
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: 'center',
  }
});
