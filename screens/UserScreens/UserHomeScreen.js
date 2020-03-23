import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
    Platform,
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

  // Function that handles changing time state
  const onChange = (event, selectedDate) => {
    setShow(false);
    const currentDate = selectedDate || time;
    setTime(currentDate);
  };

  const showTimePicker = () => {
    setShow(true);
  };

  // upon clicking request safewalk button
  const createSafeWalk = async () => {
    // TODO: This is where the fetch would be to send safewalk information to the database
  };

  const formatTime = () => {
    let timeArray = time.toString().split(" ")[4].split(":");
    if (timeArray[0] > 12) {
      return parseInt(timeArray[0]) - 12 + ":" + timeArray[1] + " PM";
    } else {
      return timeArray[0] + ":" + timeArray[1] + " AM";
    }
  };

  // TODO: How to get response from database when request is accepted (some sort of fetching process by polling?)

  // TODO: Fix formatting of input fields and unfocus of time input field
  return (
    <View style={{ flex: 1 }}>
      {!request ? (
        <View style={styles.container}>
          <Input
            inputStyle={styles.input}
            inputContainerStyle={{
              borderBottomWidth: 0,
              marginBottom: 20,
              marginTop: 20
            }}
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
            inputContainerStyle={{ borderBottomWidth: 0, marginBottom: 20 }}
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
          />
          {Platform.OS === "android" ?
              <Input
                  inputStyle={styles.time}
                  inputContainerStyle={{ borderBottomWidth: 0, marginBottom: 20 }}
                  style={{marginLeft: 50}}
                  placeholder={"Time"}
                  value={formatTime()}
                  onFocus={showTimePicker}
                  leftIcon={{
                    type: "font-awesome",
                    name: "clock-o"
                  }}
              /> :
              <View style={{ flex: 0.5, flexDirection: "row" }}>
                <Icon
                    type="font-awesome"
                    name="clock-o"
                    iconStyle={{ marginLeft: 10 }}
                />
                <DateTimePicker
                  style={{
                    height: 40,
                    width: 305,
                    borderColor: colors.orange,
                    borderWidth: 2,
                    marginLeft: 18,
                    borderRadius: 5
                  }}
                  testID="dateTimePicker"
                  mode={"time"}
                  value={time}
                  display="default"
                  onChange={onChange}
                />
              </View>
            }
            {show && (
                <DateTimePicker
                    style={{
                      height: 40,
                      width: 305,
                      borderColor: colors.orange,
                      borderWidth: 2,
                      marginLeft: 18,
                      borderRadius: 5
                    }}
                    testID="dateTimePicker"
                    mode={"time"}
                    value={time}
                    display="spinner"
                    onChange={onChange}
                />
            )}
          <Image
            style={{
              width: Dimensions.get("window").width,
              height: 350,
              marginBottom: 50,
              borderColor: colors.orange,
              borderWidth: 2
            }}
            source={{ uri: "https://i.stack.imgur.com/qs4Oo.png" }}
          />
          <TouchableOpacity onPress={() => setRequest(true)}>
            <Text style={styles.buttonRequest}> Request SAFEwalk </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={{ fontSize: 45, marginTop: 50, marginBottom: 50 }}>
            Searching for a {'\n'} SAFEwalker...
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
    borderColor: colors.orange,
    borderWidth: 2,
    borderRadius: 5,
    marginLeft: 20
  },
  time: {
    borderColor: colors.orange,
    borderWidth: 2,
    borderRadius: 5,
    marginLeft: 13
  }
});
