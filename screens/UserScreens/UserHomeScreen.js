import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import io from "socket.io-client";

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState(new Date());
  const [request, setRequest] = useState(false);

  useEffect(() => {
    this.socket = io("http://10.140.88.110:3000");

    this.socket.on("socket id", id => {
      console.log(id);
      // PutUser with socket id
    });
  }, []);

  // send messag
  function addRequest() {
    setRequest(true);
    // addWalk API
    this.socket.emit("user changed walk", true); // send notification to Safewalkers
  }

  function cancelRequest() {
    setRequest(false);
    // removeWalk API
    this.socket.emit("user changed walk", true); // send notification to Safewalkers
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setTime(currentDate);
  };

  // TODO: Add styling to sheet at bottom
  //
  return (
    <View style={{ flex: 1 }}>
      {!request ? (
        <View style={styles.container}>
          <Input
            inputStyle={{
              height: 40,
              width: 20,
              borderColor: "orange",
              borderWidth: 2,
              borderRadius: 5,
              marginLeft: 20
            }}
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
            inputStyle={{
              height: 40,
              width: 20,
              borderColor: "orange",
              borderWidth: 2,
              borderRadius: 5,
              marginLeft: 20
            }}
            inputContainerStyle={{ borderBottomWidth: 0, marginBottom: 20 }}
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
            leftIcon={{
              type: "font-awesome",
              name: "map-marker"
            }}
          />
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
                borderColor: "orange",
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
          <Image
            style={{
              width: Dimensions.get("window").width,
              height: 350,
              marginBottom: 50,
              borderColor: "orange",
              borderWidth: 2
            }}
            source={{ uri: "https://i.stack.imgur.com/qs4Oo.png" }}
          />
          <TouchableOpacity onPress={() => addRequest()}>
            <Text style={styles.buttonRequest}> Request SAFEwalk </Text>
          </TouchableOpacity>
        </View>
      ) : (
          <View style={styles.container}>
            <Text style={{ fontSize: 45, marginTop: 50, marginBottom: 50 }}>
              {" "}
            Searching for a SAFEwalker...{" "}
            </Text>
            <Icon
              type="font-awesome"
              name="hourglass"
              color="orange"
              size={150}
              iconStyle={{ marginBottom: 50 }}
            />
            <TouchableOpacity onPress={() => cancelRequest()}>
              <Text style={styles.buttonCancel}> Cancel </Text>
            </TouchableOpacity>
            <Button
              title="Go to User Tabs"
              onPress={() => navigation.navigate("UserTab")}
            />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  buttonRequest: {
    backgroundColor: "orange",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center"
  },
  buttonCancel: {
    backgroundColor: "red",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    width: 200
  }
});
