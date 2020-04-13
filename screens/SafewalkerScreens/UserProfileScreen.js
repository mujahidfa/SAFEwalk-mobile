import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Linking } from "expo";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

// Libraries
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function UserProfileScreen({ navigation }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");
  const [address, setAddress] = useState("728 State St");
  const [postalCode, setPostalCode] = useState("53715");
  const [city, setCity] = useState("Madison");

  const { userToken, email } = useContext(AuthContext);
  const { walkId, userEmail, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    // socket to listen to user status change
    socket.on("user walk status", (status) => {
      switch (status) {
        // user canceled the walk
        case -2:
          resetWalkContextState();
          alert("The user canceled the walk.");
          break;

        default:
          console.log(
            "Unexpected socket status received in UserProfileScreen: status " +
              status
          );
      }
    });

    // socket cleanup
    return () => {
      socket.off("user walk status", null);
    };
  }, []);

  /**
   * This effect retrieves the User information associated with the walk.
   * This effect is only run when userEmail value changes to ensure data retrieved is not stale.
   */
  useEffect(() => {
    // this is to fix memory leak error
    const loadUserProfileController = new AbortController();
    const signal = loadUserProfileController.signal;

    loadUserProfile(signal);

    // API call cleanup
    return () => {
      loadUserProfileController.abort();
    };

    /**
     * Since the User's email is how the API call knows which User data to fetch,
     * putting userEmail as 2nd argument is necessary because
     * this ensures that the API call is made with the latest, updated value of UserEmail,
     * therefore ensures that the API call is made for the correct User.
     */
  }, [userEmail]);

  /**
   * Loads the user profile from the database based on the user's email
   * and fills it up in the local state.
   *
   * @param signal cancels the fetch request when component is unmounted.
   */
  async function loadUserProfile(signal) {
    try {
      // Get User API
      // Retrieve the User's personal information such as name & phone number
      const res = await fetch(url + "/api/Users/" + userEmail, {
        method: "GET",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
        },
        signal: signal,
      });

      const status = res.status;

      // Upon fetch failure/bad status
      if (status != 200 && status != 201) {
        console.log(
          "retrieving user info in loadUserProfile() in UserProfileScreen failed: status " +
            status
        );
        return;
      }

      // Upon fetch success
      else {
        // We update the local state with retrieved data
        const data = await res.json();
        setFirstname(data["firstName"]);
        setLastname(data["lastName"]);
        setPhoneNumber(data["phoneNumber"]);
        setImage(data["photo"]);
      }
    } catch (error) {
      /**
       * When the component unmounts, the AbortController will cancel any recurring fetch requests.
       * When that happens (i.e. fetch cancel), it throws an AbortError error.
       * So we catch this error to differentiate it from other errors.
       * This is the same as if (error.name === "AbortError")
       */
      if (signal.aborted) {
        return;
      }

      console.error(
        "Error in fetching data from loadUserProfile() in UserProfileScreen:" +
          error
      );
    }
  }

  /**
   * Upon cancel button press, we delete the walk in the database using a DELETE request to the API.
   * If successful,
   *  - we emit a message to the User that walk has been cancelled,
   *  - we remove all walk data from Context, and
   *  - we navigate back to home screen.
   */
  async function cancelWalk() {
    try {
      // Delete Walk API call
      // Delete the current walk in the database
      const res = await fetch(url + "/api/Walks/" + walkId, {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
        },
      });

      let status = res.status;

      // Upon fetch failure/bad status
      if (status != 200 && status != 201) {
        console.log(
          "deleting walk failed in cancelWalk() in UserProfileScreen: status " +
            status
        );

        return;
      }

      // Upon fetch success
      else {
        // if userSocketId is not null
        if (userSocketId) {
          // notify the user that walk has been cancelled
          socket.emit("walker walk status", {
            userId: userSocketId,
            status: -2,
          });
        }

        // Remove all current walk-related information
        // and bring navigation back to InactiveWalk screens
        resetWalkContextState();

        alert("You canceled the walk.");
      }
    } catch (error) {
      console.error(
        "Error in cancelling walk from cancelWalk() in UserProfileScreen:" +
          error
      );
    }
  }

  function handleCall() {
    Linking.openURL("tel:+1" + phoneNumber);
  }

  function handleText() {
    Linking.openURL("sms:+1" + phoneNumber);
  }

  function handleMaps() {
    let daddr = encodeURIComponent(`${address} ${postalCode}, ${city}`);

    Linking.openURL(`https://maps.google.com/?daddr=${daddr}`);
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <BButton title="Cancel" onPress={() => cancelWalk()} />
        </View>
        <Spacer />
      </View>
    </SafeAreaView>
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
