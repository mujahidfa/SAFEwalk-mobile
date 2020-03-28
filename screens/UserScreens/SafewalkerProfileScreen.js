import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, AsyncStorage } from "react-native";
import { Button } from "react-native-elements";
import { Linking } from "expo";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";

export default function SafewalkerProfileScreen({ navigation }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { userToken, email } = useContext(AuthContext);

  async function loadWalkerProfile() {
    const walkId = await AsyncStorage.getItem('walkId');
    console.log('walkId: ' + walkId);

    // GetWalk API call - get email
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks/' + walkId, {
      method: 'GET',
      headers: {
        'token': userToken,
        'email': email,
        'isUser': true
      }
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("get walk failed: status " + status);
      return;
    }

    const data = await res.json();
    const walkerEmail = data['walkerEmail'];
    await AsyncStorage.setItem('walkerEmail', walkerEmail);

    // GetWalker API call
    const res1 = await fetch('https://safewalkapplication.azurewebsites.net/api/Safewalkers/' + walkerEmail, {
      method: 'GET',
      headers: {
        'token': userToken,
        'email': email,
        'isUser': true
      }
    });

    status = res1.status;
    if (status != 200 && status != 201) {
      console.log("get user failed: status " + status);
      return;
    }

    const data1 = await res1.json();
    console.log(data1);
    // set safewalker profile info
    setFirstname(data1['firstName']);
    setLastname(data1['lastName']);
    setPhoneNumber(data1['phoneNumber']);

    // set socketId in async storage
    await AsyncStorage.setItem('walkerSocketId', data1['socketId']);
  }

  useEffect(() => {
    loadWalkerProfile();
  }, []);

  function handleCall() {
    Linking.openURL("tel:+1" + phoneNumber);
  }

  function handleText() {
    Linking.openURL("sms:+1" + phoneNumber);
  }

  async function cancelWalk() {
    // get socketId from async storage
    const walkerSocketId = await AsyncStorage.getItem('walkerSocketId');
    if (walkerSocketId) {
      // notify user walk has been cancelled
      socket.emit("user walk status", { walkerId: walkerSocketId, status: -2 });
    }

    const id = await AsyncStorage.getItem('walkId');
    // DeleteWalk API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks/' + id, {
      method: 'DELETE',
      headers: {
        'token': userToken,
        'email': email,
        'isUser': true
      }
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
      return;
    }

    // remove all current walk-related information
    await AsyncStorage.removeItem('walkId');
    await AsyncStorage.removeItem('walkerEmail');
    await AsyncStorage.removeItem('walkerSocketId');

    navigation.navigate('UserHome');
    alert('Canceled Walk');
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
