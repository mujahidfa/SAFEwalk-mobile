import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, AsyncStorage, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Linking } from "expo";
import { Ionicons, EvilIcons, FontAwesome } from "@expo/vector-icons";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";

export default function UserProfileScreen({ navigation }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("728 State St");
  const [postalCode, setPostalCode] = useState("53715");
  const [city, setCity] = useState("Madison");
  const { userToken, email } = useContext(AuthContext);

  async function loadUserProfile() {
    // get user email from async storage
    const userEmail = await AsyncStorage.getItem("userEmail");

    // GetUser API
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Users/" + userEmail,
      {
        method: "GET",
        headers: {
          token: userToken,
          email: email,
          isUser: false
        }
      }
    );

    const status = res.status;
    if (status != 200 && status != 201) {
      console.log("get user failed: status " + status);
      return;
    }

    const data = await res.json();
    setFirstname(data['firstName']);
    setLastname(data['lastName']);
    setPhoneNumber(data['phoneNumber']);
  }

  async function cleanUpStorage() {
    // remove all current walk-related information
    await AsyncStorage.removeItem('walkId');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSocketId');
  }

  useEffect(() => {
    // socket to listen to user status change
    socket.on('user walk status', status => {
      switch (status) {
        case -2:
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'SafewalkerHome'
              }
            ]
          });
          Alert.alert(
            'The user canceled the walk.',
            '',
            [
              {text: 'OK'},
            ],
            { cancelable: false }
          );
          cleanUpStorage();
          break;
      }
    });

    loadUserProfile();

    return () => socket.off("user walk status", null);
  }, []);

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

  async function cancelWalk() {
    const userSocketId = await AsyncStorage.getItem('userSocketId');
    if (userSocketId) {
      // notify user walk has been cancelled
      socket.emit("walker walk status", { userId: userSocketId, status: -2 });
    }

    const id = await AsyncStorage.getItem("walkId");
    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: false
        }
      }
    );

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
    } else {
      Alert.alert(
        'You canceled the walk.',
        '',
        [
          {text: 'OK'},
        ],
        { cancelable: false }
      )
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SafewalkerHome'
        }
      ]
    });

    // remove all current walk-related information
    cleanUpStorage();
  }

  return (
    <View style={styles.container}>
      <FontAwesome
        name="user-circle"
        size={100}
        style={styles.profilePicture}
      />
      <Text style={styles.textName}>
        {firstname} {lastname}
      </Text>
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

      <Button
        title="Navigate using Maps"
        buttonStyle={styles.buttonCancel}
        icon={<EvilIcons name="external-link" size={25} color={colors.white} />}
        iconRight={true}
        onPress={() => handleMaps()}
      />
      <Button
        title="Cancel"
        buttonStyle={styles.buttonCancel}
        onPress={() => cancelWalk()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "stretch",
    justifyContent: "center"
  },
  profilePicture: {
    alignSelf: "center",
    marginBottom: 30
  },
  textName: {
    alignSelf: "center",
    fontSize: 30,
    marginBottom: 40
  },
  buttonContactContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 100
  },
  buttonCall: {
    backgroundColor: colors.gray,
    borderRadius: 15,
    width: 80,
    height: 80
  },
  buttonText: {
    backgroundColor: colors.gray,
    borderRadius: 15,
    width: 80,
    height: 80
  },
  buttonCancel: {
    marginBottom: 40,
    height: 60,
    borderRadius: 50,
    backgroundColor: colors.red,
    marginHorizontal: 40
  }
});
