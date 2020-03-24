import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Keyboard
} from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "./../../constants/colors";

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState(new Date());
  const [request, setRequest] = useState(false);
  const [show, setShow] = useState(false);

  // TODO: ADD socket functions from Justin's code here

  // Function that handles changing time state
  const onChange = (event, selectedDate) => {
    setShow(false);
    const currentDate = selectedDate || time;
    setTime(currentDate);
  };

  const showTimePicker = () => {
    Keyboard.dismiss();
    setShow(true);
  };

  // upon clicking request safewalk button
  const createSafeWalk = async () => {
    // TODO: This is where the fetch would be to send safewalk information to the database
  };

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

          {/* Submit Request Button */}
          <TouchableOpacity onPress={() => setRequest(true)}>
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
          <TouchableOpacity onPress={() => setRequest(false)}>
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
