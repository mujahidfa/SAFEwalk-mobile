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

import { AuthContext } from "./../../../contexts/AuthProvider";

export default function SafewalkerLoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  // forms input handling
  const { register, setValue, handleSubmit, errors } = useForm();

  // update email and password input upon change
  useEffect(() => {
    register("email");
    register("password");
  }, [register]);

  // upon pressing the submit button
  const onSubmit = data => {
    // const message =
    //   "Email: " + data.email + "\n" + "Password: " + data.password;
    // Alert.alert("Form Data", message);
    login("safewalker", { email: data.email, password: data.password });
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

          <View style={styles.buttonContainer}>
            <Button
              title="Login as SAFEwalker"
              onPress={handleSubmit(onSubmit)}
              // onPress={() => login("safewalker", { email, password })}
              buttonStyle={styles.buttonLogin}
              titleStyle={styles.buttonLoginText}
            />
          </View>
        </KeyboardAvoidingView>
        <View style={styles.footerContainer}>
          <Text style={styles.footerPrompt}>Not a SAFEwalker?</Text>
          <TouchableOpacity onPress={() => navigation.replace("UserLogin")}>
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
    marginBottom: 60
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
    backgroundColor: colors.orange
  },
  buttonLoginText: {
    fontSize: 20
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
