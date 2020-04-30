import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Linking } from "expo";
import { Ionicons } from "@expo/vector-icons";

// Libraries
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Avatar } from "react-native-paper";
import { Button } from "react-native-elements";

// Custom components
import BButton from "./../../components/Button";
import Spacer from "./../../components/Spacer";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";
import style from "./../../constants/style";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";

export default function SafewalkerProfileScreen({ navigation }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");

  const { userToken, email } = useContext(AuthContext);
  const {
    walkId,
    walkerSocketId,
    setWalkerInfo,
    resetWalkContextState,
  } = useContext(WalkContext);

  /**
   * This effect sets up the socket connection to listen to responses by the SAFEwalker.
   * This effect also retrieves the SAFEwalker information from the database.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    // this is to fix memory leak error: Promise cleanup
    const firstFetchloadWalkerProfileController = new AbortController();
    const secondFetchloadWalkerProfileController = new AbortController();
    const signalFirstFetch = firstFetchloadWalkerProfileController.signal;
    const signalSecondFetch = secondFetchloadWalkerProfileController.signal;

    loadWalkerProfile(signalFirstFetch, signalSecondFetch);

    socket.removeAllListeners();

    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      console.log(status);
      switch (status) {
        // SAFEwalker has canceled the walk.
        case -2:
          resetWalkContextState();
          alert("The SAFEwalker has canceled the walk.");
          break;

        // SAFEwalker has marked the walk as completed
        case 2:
          resetWalkContextState();
          alert("The walk has been completed!");
          break;

        default:
          console.log(
            "Unexpected socket status received in SafewalkerProfileScreen: status " +
              status
          );
      }
    });

    socket.on("connection lost", (status) => {
      if (status) {
        deleteWalk();

        // reset the Walk states
        // This will bring navigation to InactiveWalk screens
        resetWalkContextState();
        alert("Connection lost, walk cancelled.");
      }
    });

    // cleanups
    return () => {
      socket.off("walker walk status", null);
      socket.off("connection lost", null);
      firstFetchloadWalkerProfileController.abort();
      secondFetchloadWalkerProfileController.abort();
    };
  }, []);

  /**
   * Loads the SAFEwalker profile from the database and fills them in local state
   *
   * @param signalOne cancels the first fetch request when component is unmounted.
   * @param signalTwo cancels the second fetch request when component is unmounted.
   */
  async function loadWalkerProfile(signalOne, signalTwo) {
    // Get Walk API call
    // retrieve the SAFEwalker email and socket ID
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "GET",
      headers: {
        token: userToken,
        email: email,
        isUser: true,
      },
      signal: signalOne,
    }).catch((error) => {
      // cancel fetch upon component unmount
      if (signalOne.aborted) {
        return; // exit
      }
      console.error(
        "Error in GET SAFEwalker email and walker ID in loadWalkerProfile() in SafewalkerProfileScreen:" +
          error
      );
    });

    if (res == null) {
      return; // exit
    }

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "get SAFEwalker email & socket ID in loadWalkerProfile() in SafewalkerProfileScreen failed: status " +
          status
      );
      return; // exit
    }

    // Store walker data in Context
    const data = await res.json();
    const walkerEmail = data["walkerEmail"];
    const walkerSocketId = data["walkerSocketId"];

    // store walker data in Context
    setWalkerInfo(walkerEmail, walkerSocketId);

    // Get Walker API call
    // Get the SAFEwalker's name and phone number
    const res1 = await fetch(url + "/api/Safewalkers/" + walkerEmail, {
      method: "GET",
      headers: {
        token: userToken,
        email: email,
        isUser: true,
      },
      signal: signalTwo,
    }).catch((error) => {
      // cancel fetch upon component unmount
      if (signalTwo.aborted) {
        return; // exit
      }
      console.error(
        "Error in retrieving SAFEwalker name and phone number in loadWalkerProfile() in SafewalkerProfileScreen:" +
          error
      );
    });

    if (res1 == null) {
      return; // exit
    }

    status = res1.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "get SAFEwalker name & phone number in loadWalkerProfile() in SafewalkerProfileScreen failed: status " +
          status
      );
      return; // exit
    }

    const data1 = await res1.json();
    // update retrieved SAFEwalker profile info in local state
    setFirstname(data1["firstName"]);
    setLastname(data1["lastName"]);
    setPhoneNumber(data1["phoneNumber"]);
  }

  async function deleteWalk() {
    // Delete Walk API call
    // Delete the cancelled walk in the database
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "DELETE",
      headers: {
        token: userToken,
        email: email,
        isUser: true,
      },
    }).catch((error) => {
      console.error(
        "Error in deleting a walk in cancelWalk() in SafewalkerProfileScreen:" +
          error
      );
    });

    let status = res.status;
    // Upon delete failure/bad status
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
    }
  }

  /**
   * Upon button press, User cancels the walk.
   */
  async function cancelWalk() {
    await deleteWalk();

    if (walkerSocketId) {
      // notify the SAFEwalker that the walk has been cancelled
      socket.emit("user walk status", {
        walkerId: walkerSocketId,
        status: -2,
      });
    }

    // reset the Walk states
    // This will bring navigation to InactiveWalk screens
    resetWalkContextState();
    alert("Canceled Walk");
  }

  function handleCall() {
    Linking.openURL("tel:+1" + phoneNumber);
  }

  function handleText() {
    Linking.openURL("sms:+1" + phoneNumber);
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.profileContainer}>
          <Avatar.Image
            source={{
              uri: !image
                ? "https://ui-avatars.com/api/?name=" +
                  firstname +
                  "+" +
                  lastname
                : image,
            }}
            size={wp("30%")}
          />
          <Spacer />
          <Text style={styles.textName}>
            {firstname} {lastname}
          </Text>
        </View>

        <View style={styles.buttonContactContainer}>
          <Button
            icon={<Ionicons name="ios-call" size={60} color={colors.white} />}
            buttonStyle={styles.buttonCall}
            onPress={() => handleCall()}
          />
          <Button
            icon={<Ionicons name="md-text" size={60} color={colors.white} />}
            buttonStyle={styles.buttonText}
            onPress={() => handleText()}
          />
        </View>

        <View style={styles.buttonCancelContainer}>
          <BButton title="Cancel" onPress={() => cancelWalk()} color="red" />
          <Spacer />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
    justifyContent: "space-between",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePicture: {},
  textName: {
    fontSize: wp("9%"), //30,
    color: colors.gray,
  },
  buttonContactContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonCall: {
    backgroundColor: colors.gray,
    borderRadius: 15,
    width: hp("11%"), //80,
    height: hp("11%"), //80,
  },
  buttonText: {
    backgroundColor: colors.gray,
    borderRadius: 15,
    width: hp("11%"), //80,
    height: hp("11%"), //80,
  },
  buttonCancelContainer: {},
});
