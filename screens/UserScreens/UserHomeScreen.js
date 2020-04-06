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
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 43.076492;
const LONGITUDE = -89.401185;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

var initialRegion = {
  latitude: LATITUDE,
  longitude: LONGITUDE,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function UserHomeScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState(new Date());
  const [request, setRequest] = useState(false);
  const [show, setShow] = useState(false);
  const { userToken, email } = useContext(AuthContext);

  const [region, setRegion] = useState(
    {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    }
  );

  async function getInitialState() {
    return {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
    };
  }

  async function onRegionChange(region) {
    setRegion({ region });
  }

  async function onRegionChangeComplete(region){
    useState({ region });
  }

  async function onRegionChange(region) {
    useState({ region });
  }

  async function setSocketId() {
    // PutUser API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Users/" + email,
      {
        method: "PUT",
        headers: {
          token: userToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          socketId: socket.id
        })
      }
    );

    if (status != 200 && status != 201) {
      console.log("set socketId failed: status " + status);
      return;
    }
  }

  useEffect(() => {
    console.log("socket id " + socket.id);
    setSocketId();

    // socket to listen to walker status change
    socket.on("walker walk status", status => {
      console.log(status);

      switch (status) {
        case -2:
          // navigation.navigate('UserHome');
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome"
              }
            ]
          });
          alert("The SAFEwalker has canceled the walk.");
          break;
        case -1:
          setRequest(false);
          alert("Your request was denied.");
          break;
        case 1:
          // navigation.navigate("UserTab");
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserTab"
              }
            ]
          });
          alert("A SAFEwalker is on their way!");
          setRequest(false);
          break;
        case 2:
          // navigation.navigate("UserHome");
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome"
              }
            ]
          });
          alert("The walk has been completed!");
          break;
      }
    });
  }, []);

  async function addRequest() {
    // addWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks",
      {
        method: "POST",
        headers: {
          token: userToken,
          email: email,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          time: new Date(),
          startText: location,
          destText: destination
        })
      }
    );

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("add walk failed: status " + status);
      return;
    }

    let data = await res.json();
    await AsyncStorage.setItem("walkId", data["id"]);

    setRequest(true);
    socket.emit("walk status", true); // send notification to all Safewalkers
  }

  async function cancelRequest() {
    setRequest(false);
    alert("Request Canceled");

    const id = await AsyncStorage.getItem("walkId");
    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: true
        }
      }
    );

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
      return;
    }

    // remove walk-related info
    await AsyncStorage.removeItem("WalkId");

    socket.emit("walk status", true); // send notification to all Safewalkers
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Conditional Statement Based on if the User has made a Request */}
      {!request ? (
        <View style={styles.container}>
          {/* User Start and End Location Input Fields */}
          <MapView
            initialRegion={initialRegion}
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            onRegionChangeComplete={onRegionChangeComplete}
            onRegionChange={onRegionChange}
            showsUserLocation={true}
            ref={map => {
                map = map;
            }}
            minZoomLevel={10}
            maxZoomLevel={15}
          >
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
          </MapView>
          <TouchableOpacity onPress={() => addRequest()}>
            <Text style={styles.buttonRequest}> Request SAFEwalk </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          {/* View When the User Submits a SAFEwalk Request */}
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              color: colors.orange,
              fontWeight: "bold"
            }}
          >
            Searching for {"\n"} SAFEwalker...
          </Text>
          <Icon
            type="font-awesome"
            name="hourglass"
            color={colors.orange}
            size={80}
            iconStyle={{ marginBottom: 100 }}
          />
          <TouchableOpacity onPress={() => cancelRequest()}>
            <Text style={styles.buttonCancel}> Cancel </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "space-around"
  },
  buttonRequest: {
    backgroundColor: "#77b01a",
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginBottom: 110
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
    marginLeft: 20,
  },
  inputContainer: {
    marginBottom: 20,
    marginTop: 0,
    borderColor: 'transparent',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 5
  },
  inputContainerTop: {
    marginBottom: 20,
    marginTop: 20,
    borderColor: 'transparent',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 5
  },
  image: {
    width: Dimensions.get("window").width,
    height: 350,
    marginBottom: 30,
    borderColor: colors.orange,
    borderWidth: 2
  },
  mapStyle: {
    marginTop: 50,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height-90,
  }
});
