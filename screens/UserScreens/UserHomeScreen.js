import React, { useState, useEffect, useContext, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Input } from "react-native-elements";
import { useForm } from "react-hook-form";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const { userToken, email } = useContext(AuthContext);
  const { setWalkId } = useContext(WalkContext);

  // forms input handling
  const { register, setValue, errors, triggerValidation } = useForm();

  const changeLocation = (type, location) => {
    if (type === "start") {
      setValue("startLocation", location, true);
      setLocation(location);
    } else {
      setValue("endLocation", location, true);
      setDestination(location);
    }
  };

  async function addRequest() {
    const startLocationNotEmpty = await triggerValidation("startLocation");
    const destinationNotEmpty = await triggerValidation("endLocation");

    if (startLocationNotEmpty && destinationNotEmpty) {
      // addWalk API call - create walk
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
      });

      let status = res.status;
      if (status !== 200 && status !== 201) {
        console.log("UserHome: add walk failed: status " + status);
        return;
      }

      let data = await res.json();

      // store walkId in Context and AsyncStorage
      setWalkId(data["id"]);

      socket.emit("walk status", true); // send notification to all Safewalkers
      // keep this
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "UserWait",
          },
        ],
      });
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* User Start and End Location Input Fields */}
        {errors.startLocation && (
          <Text style={styles.textError}>
            A start location is required to submit a request.
          </Text>
        )}
        <Input
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainerTop}
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
        {errors.endLocation && (
          <Text style={styles.textError}>
            A destination is required to submit a request.
          </Text>
        )}
        <Input
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
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

        {/* Google Map */}
        <Image
          style={styles.image}
          source={{ uri: "https://i.stack.imgur.com/qs4Oo.png" }}
        />
        <TouchableOpacity onPress={() => addRequest()}>
          <Text style={styles.buttonRequest}> Request SAFEwalk Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  buttonRequest: {
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
  },
  buttonCancel: {
    backgroundColor: colors.red,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    width: 200,
  },
  input: {
    marginLeft: 20,
  },
  inputContainer: {
    marginBottom: 20,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 5,
  },
  inputContainerTop: {
    marginBottom: 20,
    marginTop: 10,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 5,
  },
  image: {
    width: Dimensions.get("window").width,
    height: 350,
    marginBottom: 40,
    marginTop: 20,
  },
  textError: {
    color: colors.red,
    marginTop: 5,
  },
});
