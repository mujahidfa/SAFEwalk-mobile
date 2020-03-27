import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Keyboard,
  AsyncStorage
} from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import io from "socket.io-client";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState(new Date());
  const [request, setRequest] = useState(false);
  const [show, setShow] = useState(false);
  const {userToken, email} = useContext(AuthContext);

  async function setSocketId() {
    const email = await AsyncStorage.getItem('email');

    // PutUser API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Users/' + email, {
      method: 'PUT',
      headers: {
        'token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        socketId: socket.id
      })
    });

    if (status != 200 && status != 201) {
      console.log("set socketId failed: status " + status);
      return;
    }
  }

  useEffect(() => {
    console.log('socket id ' + socket.id);
    setSocketId();

    // socket to listen to walker status change
    socket.on('walker walk status', status => {
      console.log(status);
      
      switch (status) {
        case -2:
          navigation.navigate('UserHome');
          alert('The SAFEwalker has canceled the walk.');
          break;
        case -1:
          setRequest(false);
          alert('Your request was denied.');
          break;
        case 1:
          navigation.navigate('UserTab');
          alert('A SAFEwalker is on their way!');
          setRequest(false);
          break;
        case 2:
          navigation.navigate('UserHome');
          alert('The walk has been completed!');
          break;
      }
    });
  }, []);

  async function addRequest() {
    const email = await AsyncStorage.getItem('email');

    // addWalk API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks', {
      method: 'POST',
      headers: {
        'token': userToken, 
        'email': email,      
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        time: new Date(),
        startText: location,
        destText: destination
      })
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("add walk failed: status " + status);
      return;
    }

    let data = await res.json();
    await AsyncStorage.setItem('walkId', data['id']);

    setRequest(true);
    socket.emit("walk status", true); // send notification to all Safewalkers
  }

  async function cancelRequest() {
    setRequest(false);
    alert("Request Canceled");

    const email = await AsyncStorage.getItem('email');
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

    // remove walk-related info
    await AsyncStorage.removeItem('WalkId');

    socket.emit("walk status", true); // send notification to all Safewalkers
  }

  // Function that handles changing time state
  const onChange = (event, selectedDate) => {
    setShow(false);
    const currentDate = selectedDate || time;
    setTime(currentDate);
  };

  // Function that handles android time picker
  const showTimePicker = () => {
    Keyboard.dismiss();
    setShow(true);
  };

  // Function that formats dateTime objects for visual representation
  const formatTime = () => {
    let timeArray = time
      .toString()
      .split(" ")[4]
      .split(":");
    if (timeArray[0] >= 12) {
      if (timeArray[0] === "12") timeArray[0] = "24";
      return parseInt(timeArray[0]) - 12 + ":" + timeArray[1] + " PM";
    } else {
      if (timeArray[0] === "00") timeArray[0] = "12";
      return timeArray[0] + ":" + timeArray[1] + " AM";
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Conditional Statement Based on if the User has made a Request */}
      {!request ? (
        <View style={styles.container}>
          {/* User Start and End Location Input Fields */}
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainerTop}
            placeholder="Start Location"
            value={location}
            onChangeText={setLocation}
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
          />
          <Input
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
          />

          {/* Time Picker for Android and IOS */}
          {Platform.OS === "android" ? (
            <Input
              inputStyle={styles.time}
              inputContainerStyle={styles.inputContainer}
              style={{ marginLeft: 50 }}
              placeholder={"Time"}
              value={formatTime()}
              onFocus={showTimePicker}
              leftIcon={{
                type: "font-awesome",
                name: "clock-o"
              }}
            />
          ) : (
              <View style={styles.timeInputIOS}>
                <Icon
                  type="font-awesome"
                  name="clock-o"
                  iconStyle={{ marginLeft: 10, top: 8 }}
                />
                <DateTimePicker
                  style={styles.timePickerIOS}
                  testID="dateTimePicker"
                  mode={"time"}
                  value={time}
                  display="default"
                  onChange={onChange}
                />
              </View>
            )}
          {show && (
            <DateTimePicker
              style={styles.timePickerAndroid}
              testID="dateTimePicker"
              mode={"time"}
              value={time}
              display="spinner"
              onChange={onChange}
            />
          )}

          {/* Google Map */}
          <Image
            style={styles.image}
            source={{ uri: "https://i.stack.imgur.com/qs4Oo.png" }}
          />
          <TouchableOpacity onPress={() => addRequest()}>
            <Text style={styles.buttonRequest}> Request SAFEwalk </Text>
          </TouchableOpacity>
        </View>
      ) : (
          <View style={styles.container}>
            {/* View When the User Submits a SAFEwalk Request */}
            <Text style={{ fontSize: 45, marginTop: 50, marginBottom: 50 }}>
              Searching for a {"\n"} SAFEwalker...
          </Text>
            <Icon
              type="font-awesome"
              name="hourglass"
              color={colors.orange}
              size={150}
              iconStyle={{ marginBottom: 50 }}
            />
            <TouchableOpacity onPress={() => cancelRequest()}>
              <Text style={styles.buttonCancel}> Cancel </Text>
            </TouchableOpacity>

            {/* Button to be Replaced Once Sockets are implemented */}
            <Button
              title="Go to User Tabs"
              onPress={() => navigation.replace("UserTab")}
            />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center"
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
    textAlign: "center"
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
    width: 200
  },
  input: {
    marginLeft: 20
  },
  time: {
    marginLeft: 13
  },
  inputContainer: {
    marginBottom: 20,
    borderColor: colors.orange,
    borderWidth: 2,
    borderRadius: 5
  },
  inputContainerTop: {
    marginBottom: 20,
    marginTop: 20,
    borderColor: colors.orange,
    borderWidth: 2,
    borderRadius: 5
  },
  timePickerAndroid: {
    height: 40,
    width: 305,
    borderColor: colors.orange,
    borderWidth: 2,
    marginLeft: 18,
    borderRadius: 5
  },
  timePickerIOS: {
    height: 40,
    width: 305,
    marginLeft: 18
  },
  image: {
    width: Dimensions.get("window").width,
    height: 350,
    marginBottom: 30,
    borderColor: colors.orange,
    borderWidth: 2
  },
  timeInputIOS: {
    flex: 0.5,
    flexDirection: "row",
    borderColor: colors.orange,
    borderWidth: 2,
    borderRadius: 5,
    height: 20,
    marginBottom: 45
  }
});
