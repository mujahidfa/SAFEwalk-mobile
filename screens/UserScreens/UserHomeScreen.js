import React, { useState, useEffect, useContext, useRef } from "react";
import axios from 'axios';
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  Keyboard
} from "react-native";
import { Input } from "react-native-elements";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Components
// import Button from "./../../components/Button"
import Button from "react-native-paper";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";
import style from "./../../constants/style"

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";
import MapView, { Marker, PROVIDER_GOOGLE, fitToElements } from "react-native-maps";

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 43.076492;
const LONGITUDE = -89.401185;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// temporary - replace with home address API call
const homePlace = {
  description: 'Home',
  text: "",
  coordinates: {
    latitude: 43.081606,
    longitude: -89.376298
  }
};

const pinColor = ["#46C4FF", "red"]

export default function UserHomeScreen({ navigation }) {

  const mapRef = useRef(null);

  // store current user location
  const [location, setLocation] = useState({
    coordinates: {
      latitude: 43.081606,
      longitude: -89.376298
    },
    text: ""
  });

  // destination
  const [destination, setDestination] = useState({
    coordinates: {
      latitude: +43.081606,
      longitude: -89.376298
    },
    text: ""
  });

  // walk origin - default to current location
  const [start, setStart] = useState({
    coordinates: {
      latitude: 43.075143,
      longitude: -89.400151
    },
    text: ""
  });

  const [eta, setEta] = useState("0");
  const [duration, setDuration] = useState("0 minutes");

  // markers and locations
  const [markers, setMarkers] = useState([
    {
      key: 0,
      title: 'Start',
      coordinates: {
        latitude: start.coordinates.latitude,
        longitude: start.coordinates.longitude
      }
    },
    {
      key: 1,
      title: 'Destination',
      coordinates: {
        // replace with api to get user's home addre
        latitude: homePlace.coordinates.latitude,
        longitude: homePlace.coordinates.longitude
      }
    }
  ]);

  const { userToken, email } = useContext(AuthContext);
  const { setWalkId } = useContext(WalkContext);

  // forms input handling
  const { register, setValue, errors, triggerValidation } = useForm();

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Make a walk request.
   *
   * First, do input checking on the location inputs
   * Next, create a new walk in the database
   * Finally, notify the SAFEwalkers that a new walk request is made, and move into
   */
  async function addRequest() {
    const startFilled = await triggerValidation("startLocation");
    const endFilled = await triggerValidation("endLocation");

    // if start or end location is empty
    if (!startFilled || !endFilled) {
      return; // exit
    }

    console.log(destination.text);

    // Add Walk API call
    // Create a walk in the database
    const res = await fetch(url + "/api/Walks", {
      method: "POST",
      headers: {
        token: userToken,
        email: email,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time: new Date(),
        startText: start.text,
        destText: destination.text,
        userSocketId: socket.id,
      }),
    }).catch((error) => {
      console.error(
        "Error in POST walk in addRequest() in UserHomeScreen:" +
        error
      )
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status !== 200 && status !== 201) {
      console.log(
        "creating a walk request in addRequest() in UserHomeScreen failed: status " +
        status
      );
      return; // exit
    }

    let data = await res.json();
    // store walkId in the WalkContext
    setWalkId(data["id"]);

    // send notification to all Safewalkers
    socket.emit("walk status", true);

    // navigate to the wait screen (keep this)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "UserWait",
        },
      ],
    });
  }

  const changeLocation = (type, location) => {
    if (type === "start") {
      setValue("startLocation", location, true);
      setStart({
        coordinates: {
          latitude: start.coordinates.latitude,
          longitude: start.coordinates.longitude
        },
        text: location
      });
    } else {
      setValue("endLocation", location, true);
      setDestination({
        coordinates: {
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude
        },
        text: location
      });
    }
  };

  async function onStartTextChange(textValue) {
    setStart({
      coordinates: {
        latitude: start.coordinates.latitude,
        longitude: start.coordinates.longitude
      },
      text: textValue
    });
  }

  async function onDestinationTextChange(textValue) {
    setDestination({
      coordinates: {
        latitude: destination.coordinates.latitude,
        longitude: destination.coordinates.longitude
      },
      text: textValue
    });
  }

  const getStartCoordinates = text => {
    var replaced = text.split(' ').join('+');
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + replaced + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
    axios.get(axiosURL)
      .then(res => {
        console.log("OUTPUT: " + res.data.results[0].geometry.location.lat);

        start.coordinates.latitude = res.data.results[0].geometry.location.lat;
        start.coordinates.longitude = res.data.results[0].geometry.location.lng;

        console.log("RETURNING: " + res.data.results[0].geometry.location.lat);
        return res.data.results[0].geometry.location;

      })
  }

  const getDestinationCoordinates = text => {
    var replaced = text.split(' ').join('+');
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + replaced + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
    axios.get(axiosURL)
      .then(res => {
        console.log("OUTPUT: " + res.data.results[0].geometry.location.lat);

        destination.coordinates.latitude = res.data.results[0].geometry.location.lat;
        destination.coordinates.longitude = res.data.results[0].geometry.location.lng;

        console.log("RETURNING: " + res.data.results[0].geometry.location.lat);
        return res.data.results[0].geometry.location;

      })
  }

  const getStartAddress = coordinates => {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
    axios.get(axiosURL)
    .then(res => {
      console.log("OUTPUT: " + res.data.results[0].formatted_address);
      setStart({
        coordinates: {
          latitude: start.coordinates.latitude,
          longitude: start.coordinates.longitude
        },
        text: res.data.results[0].formatted_address
      })
      return(res.data.results[0].formatted_address);
    })
  }

  const getDestinationAddress = coordinates => {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
    axios.get(axiosURL)
    .then(res => {
      console.log("OUTPUT: " + res.data.results[0].formatted_address);
      setDestination({
        coordinates: {
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude
        },
        text: res.data.results[0].formatted_address
      })
      return(res.data.results[0].formatted_address);
    })
  }

  async function updateStart() {

    getStartCoordinates(start.text);

    setMarkers([
      {
        key: 0,
        title: 'Start',
        coordinates: {
          latitude: start.coordinates.latitude,
          longitude: start.coordinates.longitude
        }
      },
      {
        key: 1,
        title: 'Destination',
        coordinates: {
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude
        }
      }
    ])

    changeLocation("start", start.text);

  }

  async function updateDestination() {

    getDestinationCoordinates(destination.text);

    setMarkers([
      {
        key: 0,
        title: 'Start',
        coordinates: {
          latitude: start.coordinates.latitude,
          longitude: start.coordinates.longitude
        }
      },
      {
        key: 1,
        title: 'Destination',
        coordinates: {
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude
        }
      }
    ])

    changeLocation("destination", destination.text);

  }

  async function convertEta() {
    var today = new Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    console.log("Time: " + hours + ":" + minutes);
    console.log("Duration: " + eta)
    var replaced = duration.split(' ');
    if(replaced[1].localeCompare("hours") == 0) {
      hours = parseInt(hours) + parseInt(replaced[0]);
      minutes = parseInt(minutes) + parseInt(replaced[2]);
    }
    else{
      minutes = parseInt(minutes) + parseInt(replaced[0]);
    }

    if(minutes > 59) {
      minutes = parseInt(minutes) - 60;
      hours = parseInt(hours) + 1;
    }
    if(hours > 12) {
      hours = parseInt(hours) - 12;
    }

    if(minutes < 10) {
      minutes = "0" + minutes;
    }
    var returnString = hours + ":" + minutes;
    setEta(returnString);

    console.log(returnString);
    console.log("Updated ETA: " + eta);
  }

  async function getEta() {
    var axiosURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + start.coordinates.latitude + ", " + start.coordinates.longitude + "&destinations=" + destination.coordinates.latitude + ", " + destination.coordinates.longitude + "&mode=walking&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
    axios.get(axiosURL)
    .then(res => {
      setDuration(res.data.rows[0].elements[0].duration.text);
      convertEta();
    })
  }

  async function showLocation(position) {
    setLocation(
      {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      }
    )
 }

  async function onMapReady() {
    mapRef.current.fitToElements();
  };

  async function currentAsStart() {
    setStart({
      coordinates: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude
      },
      text: ""
    });
    setMarkers([
      {
        key: 0,
        title: 'Start',
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude
        }
      },
      {
        key: 1,
        title: 'Destination',
        coordinates: {
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude
        }
      }
    ])
    mapRef.current.fitToElements();
  }

  async function homeAsDest() {
    setDestination({
      coordinates: {
        latitude: homePlace.coordinates.latitude,
        longitude: homePlace.coordinates.longitude
      },
      text: ""
    });
    setMarkers([
      {
        key: 0,
        title: 'Start',
        coordinates: {
          latitude: start.coordinates.latitude,
          longitude: start.coordinates.longitude
        }
      },
      {
        key: 1,
        title: 'Destination',
        coordinates: {
          latitude: homePlace.coordinates.latitude,
          longitude: homePlace.coordinates.longitude
        }
      }
    ])
    mapRef.current.fitToElements();
  }

  return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            showsUserLocation={true}
            ref={mapRef}
            minZoomLevel={10}
            maxZoomLevel={15}
            onMapReady={onMapReady}
          >
            {/* User Start and End Location input fields */}
            {errors.startLocation && (
              <Text style={styles.textError}>
                A start location is required to submit a request.
              </Text>
            )}
            <Input
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainerTop}
              placeholder="Start Location"
              ref={register({ name: "startLocation" }, { required: true })}
              value={start.text}
              returnKeyType='search'
              onChangeText={onStartTextChange}
              onSubmitEditing={updateStart}
              leftIcon={{
                type: "font-awesome",
                name: "map-marker",
              }}
            />
            {errors.endLocation && (
              <Text style={styles.textError}>
                A destination is required to submit a request.
              </Text>
            )}
            <Input
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
              placeholder="Destination"
              ref={register({ name: "endLocation" }, { required: true })}
              value={destination.text}
              onChangeText={onDestinationTextChange}
              onSubmitEditing={updateDestination}
              returnKeyType='search'
              leftIcon={{
                type: "font-awesome",
                name: "map-marker",
              }}
            />
            <Text>  ETA: {eta}</Text>
            {markers.map((marker) => (
              <MapView.Marker
                key={marker.key}
                coordinate={{
                  latitude: marker.coordinates.latitude,
                  longitude: marker.coordinates.longitude
                }}
                title={marker.title}
                pinColor={pinColor[marker.key]}
              />
            ))}
          </MapView>
          <TouchableOpacity onPress={() => {navigator.geolocation.getCurrentPosition(showLocation);currentAsStart()}}>
            <Text style={styles.buttonCurrent}> Set Start to Current </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => homeAsDest()}>
            <Text style={styles.buttonCurrent}> Set Home to Dest. </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {getEta(); mapRef.current.fitToElements()}}>
            <Text style={styles.buttonConfirm}> ETA </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addRequest()}>
            <Text style={styles.buttonRequest}> Request SAFEwalk Now</Text>
          </TouchableOpacity>
        </View>
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
    borderColor: 'transparent',
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
  buttonConfirm: {
    backgroundColor: "#77b01a",
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginBottom: 200
  },
  buttonFit: {
    backgroundColor: "#77b01a",
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginTop: 160
  },
  buttonCurrent: {
    backgroundColor: "#77b01a",
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 11,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 200
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
    marginBottom: 0,
    marginTop: 0,
    borderColor: 'transparent',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 5
  },
  inputContainerTop: {
    marginBottom: 10,
    marginTop: 20,
    borderColor: 'transparent',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 5
  },
  image: {
    width: Dimensions.get("window").width - 75,
    height: 350,
    marginBottom: 40,
    marginTop: 20,
  },
  mapStyle: {
    marginTop: 90,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height-90,
  }
});
