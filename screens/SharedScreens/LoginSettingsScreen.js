import React, { useEffect } from "react";
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

  // update email and password input upon change
  useEffect(() => {
    register("email");
    register("password");
    register("confirmPassword");
  }, [register]);

  // upon pressing the submit button
  const onSubmit = data => {
    // check if passwords match

    // send post request wiht updated info
    alert('saved');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>


        
        {/* Main view */}
        <KeyboardAvoidingView style={styles.innerContainer}>
          <Image
            source={require("./../../assets/avatar.png")}
            style={styles.image}
            PlaceholderContent={<ActivityIndicator />}
          />
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
            onChangeText={text => setValue("email", text, true)}
            mode="outlined"
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
            keyboardType="email-address"
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
            theme={{ colors: { primary: colors.red } }}
            style={styles.textInput}
          />
        </KeyboardAvoidingView>

        {/* Footer */}
        <Button
          title="Save"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={styles.buttonNext}
          titleStyle={styles.buttonNextText}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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
    marginHorizontal: 50,
    marginTop: 10,
    marginBottom: 20,
    height: 50,
    backgroundColor: colors.red
  },
  buttonNextText: {
    fontSize: 17
  },
  footerContainer: {
    marginBottom: 50,
    flexDirection: "row",
    justifyContent: "center"
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
