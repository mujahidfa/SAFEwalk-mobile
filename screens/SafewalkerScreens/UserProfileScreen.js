import React, { useState, useEffect, useContext, useRef } from "react";
import { Keyboard,StyleSheet, Text, View } from "react-native";
import {Linking, Notifications} from "expo";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

// Libraries
import TimerMixin from "react-timer-mixin";
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

  const [location, setLocation] = useState({
    coordinates: {
      latitude: 43.081606,
      longitude: -89.376298,
    },
  });

  const locationRef = useRef(location);
  locationRef.current = location;

  const { userToken, email } = useContext(AuthContext);
  const { walkId, userEmail, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  mixins: [TimerMixin];

  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    socket.removeAllListeners();

    // socket to listen to user status change
    socket.on("user walk status", (status) => {
      switch (status) {
        // user canceled the walk
        case -2:
          resetWalkContextState();
          setUserCancelNotification(1000);
          alert("The user canceled the walk.");
          console.log("listened to user walk - cancelled request");
          break;

        default:
          console.log(
            "Unexpected socket status received in UserProfileScreen: status " +
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
        setCancelNotification(1000);
        alert("Connection lost, walk cancelled.");
      }
    });

    // socket cleanup
    return () => {
      socket.off("user walk status", null);
      socket.off("connection lost", null);
    };
  }, []);

  async function showLocation(position) {
    console.log(
      "Walker location: " +
        position.coords.latitude +
        ", " +
        position.coords.longitude
    );

    setLocation({
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    });
  }

  useEffect(() => {
    // send location to user every 5 seconds
    const interval = setInterval(() => {
      console.log("send");
      console.log(userSocketId);
      if (userSocketId != null) {
        console.log("sending");
        // send location to user

        navigator.geolocation.getCurrentPosition(showLocation);

        // console.log("Updated state: " + location.coordinates.latitude + ", " + location.coordinates.longitude);
        socket.emit("walker location", {
          userId: userSocketId,
          lat: locationRef.current.coordinates.latitude,
          lng: locationRef.current.coordinates.longitude,
        });
      }
    }, 5000); // 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [userSocketId]);

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


  /* Notification Setup 1
setCancelNotification: schedules notification for <time>
*/
  const CancelNotification = { title: 'Connection is Lost', body: 'Connection lost, walk cancelled.' };
  let localCancelNotificationId = null;
  const setCancelNotification = time => {
    Keyboard.dismiss();
    const schedulingOptions = {
      time: new Date().getTime() + Number(time),
    };
    // Notifications show only when app is not active.
    // (ie. another app being used or device's screen is locked)
    localCancelNotificationId  = Notifications.scheduleLocalNotificationAsync(
        CancelNotification,
        schedulingOptions,
    );
  };

  /* Notification Setup 2
setCancelNotification: schedules notification for <time>
*/
  const userCancelNotification = { title: 'Walk Cancelled', body: 'User canceled the walk' };
  let localUserCancelNotificationId = null;
  const setUserCancelNotification = time => {
    Keyboard.dismiss();
    const schedulingOptions = {
      time: new Date().getTime() + Number(time),
    };
    // Notifications show only when app is not active.
    // (ie. another app being used or device's screen is locked)
    localUserCancelNotificationId  = Notifications.scheduleLocalNotificationAsync(
        userCancelNotification,
        schedulingOptions,
    );
  };


  /**
   * Loads the user profile from the database based on the user's email
   * and fills it up in the local state.
   *
   * @param signal cancels the fetch request when component is unmounted.
   */
  async function loadUserProfile(signal) {
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
    }).catch((error) => {
      // cancel fetch upon component unmount
      if (signal.aborted) {
        return; // exit
      }
      console.error(
        "Error in fetching data from loadUserProfile() in UserProfileScreen:" +
          error
      );
    });

    if (res == null) {
      return; // exit
    }

    const status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "retrieving user info in loadUserProfile() in UserProfileScreen failed: status " +
          status
      );
      return; // exit
    }

    // We update the local state with retrieved data
    const data = await res.json();
    setFirstname(data["firstName"]);
    setLastname(data["lastName"]);
    setPhoneNumber(data["phoneNumber"]);
  }

  async function deleteWalk() {
    // Delete Walk API call
    // Delete the current walk in the database
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "DELETE",
      headers: {
        token: userToken,
        email: email,
        isUser: false,
      },
    }).catch((error) => {
      console.error(
        "Error in DELETE walk from cancelWalk() in UserProfileScreen:" + error
      );
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "deleting walk failed in cancelWalk() in UserProfileScreen: status " +
          status
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
    await deleteWalk();

    // if userSocketId is not null
    if (userSocketId != null) {
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
          <BButton title="Cancel" onPress={() => cancelWalk()} color="red" />
        </View>
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
