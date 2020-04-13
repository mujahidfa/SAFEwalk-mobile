import React, { useState, useEffect, useContext, useRef } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  View,
  Keyboard
} from "react-native";
import { Input } from "react-native-elements";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Components
import Button from "./../../components/Button"

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";
import style from "./../../constants/style"

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, email } = useContext(AuthContext);
  const { setWalkId } = useContext(WalkContext);

  // forms input handling
  const { register, setValue, errors, triggerValidation } = useForm();

  /**
   * Make a walk request.
   *
   * First, do input checking on the location inputs
   * Next, create a new walk in the database
   * Finally, notify the SAFEwalkers that a new walk request is made, and move into
   */
  async function addRequest() {
    setIsLoading(true);
    const startFilled = await triggerValidation("startLocation");
    const endFilled = await triggerValidation("endLocation");

    // if start or end location is empty
    if (!startFilled || !endFilled) {
      setIsLoading(false);
      return; // exit
    }

    // Add Walk API call
    // Create a walk in the database
    const res = await fetch(url + "/api/Walks", {
      method: "POST",
      headers: {
        token: userToken,
        email: email,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time: new Date(),
        startText: location,
        destText: destination,
        userSocketId: socket.id,
      }),
    }).catch((error) => {
      console.error(
        "Error in POST walk in addRequest() in UserHomeScreen:" +
        error
      );
      setIsLoading(false);
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status !== 200 && status !== 201) {
      console.log(
        "creating a walk request in addRequest() in UserHomeScreen failed: status " +
        status
      );
      setIsLoading(false);
      return; // exit
    }

    let data = await res.json();
    // store walkId in the WalkContext
    setWalkId(data["id"]);

    // send notification to all Safewalkers
    socket.emit("walk status", true);

    // navigate to the wait screen (keep this)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "UserWait",
        },
      ],
    });
  }

  const changeLocation = (type, location) => {
    if (type === "start") {
      setValue("startLocation", location, true);
      setLocation(location);
    } else {
      setValue("endLocation", location, true);
      setDestination(location);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          {/* User Start and End Location input fields */}
          <View style={styles.inputContainer}>
            {errors.startLocation && (
              <Text style={style.textError}>Start location is required.</Text>
            )}
            <Input
              inputStyle={styles.inputStyle}
              inputContainerStyle={styles.inputContainerStyleTop}
              containerStyle={styles.containerStyle}
              placeholder="Start Location"
              ref={register({ name: "startLocation" }, { required: true })}
              value={location}
              onChangeText={(text) => {
                changeLocation("start", text);
              }}
              leftIcon={{
                type: "font-awesome",
                name: "map-marker",
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            {errors.endLocation && (
              <Text style={style.textError}>Destination is required.</Text>
          )}
            <Input
                inputStyle={styles.inputStyle}
                inputContainerStyle={styles.inputContainerStyleBottom}
                containerStyle={styles.containerStyle}
                placeholder="Destination"
                ref={register({ name: "endLocation" }, { required: true })}
                value={destination}
                onChangeText={(text) => {
                  changeLocation("end", text);
                }}
                leftIcon={{
                  type: "font-awesome",
                  name: "map-marker",
                }}
            />
          </View>

          {/* Google Map */}
          <Image
            style={styles.image}
            source={{ uri: "https://i.stack.imgur.com/qs4Oo.png" }}
          />

          {/* Button to Submit Request */}
          <View style={styles.buttonContainer}>
            <Button
                title="Request Now"
                onPress={() => addRequest()}
                loading={isLoading}
                disabled={isLoading}
            />
          </View>
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
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: style.marginContainerHorizontal
  },
  inputContainer: {
    height: hp("7.5%"),
    justifyContent: "flex-end",
  },
  inputStyle: {
    marginLeft: 20,
  },
  containerStyle: {
    paddingLeft: 0,
    paddingRight: 0
  },
  inputContainerStyleTop: {
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 2,
  },
  inputContainerStyleBottom: {
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 2,
  },
  buttonContainer: {
    height: hp("17%"),
    justifyContent: "space-around",
  },
  image: {
    width: Dimensions.get("window").width - 75,
    height: 350,
    marginBottom: 40,
    marginTop: 20,
  },
});
