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
import { Button as ButtonE, Input, Icon } from "react-native-elements";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Components
import Button from "./../../components/Button"

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

const pinColor = ["green", "red"]

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
    text: "Current Location"
  });

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
        // replace with api to get user's home address
        latitude: homePlace.coordinates.latitude,
        longitude: homePlace.coordinates.longitude
      }
    }
  ]);

  const { userToken, email } = useContext(AuthContext);
  const { setWalkId, setCoordinates } = useContext(WalkContext);

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
        startLat: start.coordinates.latitude,
        startLng: start.coordinates.longitude,
        destText: destination.text,
        destLat: destination.coordinates.latitude,
        destLng: destination.coordinates.longitude,
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
    setWalkId(data["id"]); // store walkId in the WalkContext
    setCoordinates(
      start.coordinates.latitude + '',
      start.coordinates.longitude + '',
      destination.coordinates.latitude + '',
      destination.coordinates.longitude + ''
    ); // store coordinates in the WalkContext

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

  async function getStartCoordinates(text) {
    if(text == "Current Location") {
      navigator.geolocation.getCurrentPosition(showLocation);
      setStart({
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude
        },
        text: text
      });
      return;
    }
    var replaced = text.split(' ').join('+');
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + replaced + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
      .then(res => {
        // start.coordinates.latitude = res.data.results[0].geometry.location.lat;
        // start.coordinates.longitude = res.data.results[0].geometry.location.lng;
        setStart({
          coordinates: {
            latitude: res.data.results[0].geometry.location.lat,
            longitude: res.data.results[0].geometry.location.lng
          },
          text: text
        });
      })
  }

  async function getDestinationCoordinates(text) {
    var replaced = text.split(' ').join('+');
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + replaced + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
      .then(res => {
        // destination.coordinates.latitude = res.data.results[0].geometry.location.lat;
        // destination.coordinates.longitude = res.data.results[0].geometry.location.lng;
        setDestination({
          coordinates: {
            latitude: res.data.results[0].geometry.location.lat,
            longitude: res.data.results[0].geometry.location.lng
          },
          text: text
        });
      })
  }

  async function getStartAddress(coordinates) {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
    .then(res => {
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

  async function getDestinationAddress(coordinates) {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
    .then(res => {
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

    changeLocation("start", start.text);

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
  }

  async function updateDestination() {

    getDestinationCoordinates(destination.text);

    changeLocation("destination", destination.text);

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

  }

  async function showLocation(position) {
    setLocation(
      {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        text: "Current Location"
      }
    )
 }

  async function currentAsStart() {

    navigator.geolocation.getCurrentPosition(showLocation);

    setStart({
      coordinates: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude
      },
      text: "Current Location"
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
    // mapRef.current.fitToElements();
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
    // mapRef.current.fitToElements();
  }

  async function onMapReady() {
    currentAsStart();
    homeAsDest();
    // mapRef.current.fitToElements();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <View style={styles.container}>
         <KeyboardAvoidingView style={styles.innerContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            showsUserLocation={true}
            {/*ref={mapRef}*/}
            minZoomLevel={10}
            maxZoomLevel={15}
            onMapReady={onMapReady}
            initialRegion={{
              latitude: 43.075143,
              longitude: -89.400151,
              latitudeDelta: 0.0822,
              longitudeDelta: 0.0421,
            }}
          >
            {markers.map((marker) => (
              <MapView.Marker
                key={marker.key}
                coordinate={{
                  latitude: marker.coordinates.latitude,
                  longitude: marker.coordinates.longitude
                }}
                title={marker.title}
                pinColor={pinColor[marker.key]}
                icon={{
                  style: styles.icon,
                  type: "material",
                  name: "directions-walk"
                }}
              />
            ))}
          </MapView>
           {/* User Start and End Location input fields */}
           <View style={styles.inputContainer}>
              {errors.startLocation && (
                <Text style={style.textError}>Start location is required.</Text>
              )}
              <Input
                inputStyle={styles.inputStyle}
                inputContainerStyle={styles.inputContainerStyleTop}
                containerStyle={styles.containerStyle}
                placeholder="Start Location"
                ref={register({ name: "startLocation" }, { required: true })}
                value={start.text}
                returnKeyType='search'
                onChangeText={onStartTextChange}
                onSubmitEditing={updateStart}
                leftIcon={{
                  type: "font-awesome",
                  name: "map-marker",
                  color: "green"
                }}
                /*
                rightIcon={{
                  type: "material",
                  name: "gps-fixed",
                  onPress: () => {currentAsStart(); mapRef.current.fitToElements()}
                }}
                */
              />
              {errors.endLocation && (
                <Text style={style.textError}>Destination is required.</Text>
              )}
              <Input
                inputStyle={styles.inputStyle}
                inputContainerStyle={styles.inputContainerStyleBottom}
                containerStyle={styles.containerStyle}
                placeholder="Destination"
                ref={register({ name: "endLocation" }, { required: true })}
                value={destination.text}
                onChangeText={onDestinationTextChange}
                onSubmitEditing={updateDestination}
                returnKeyType='search'
                leftIcon={{
                  type: "font-awesome",
                  name: "map-marker",
                  color: "red"
                }}
                /*
                rightIcon={{
                  type: "font-awesome",
                  name: "home",
                  onPress: () => {homeAsDest(); mapRef.current.fitToElements()}
                }}
                */
              />

          <View style={styles.icons}>
            <Icon
              style={styles.icon}
              raised
              type= "material"
              name= "gps-fixed"
              onPress= {() => {
                currentAsStart();
                // mapRef.current.fitToElements();
              }}
              loading={isLoading}
              disabled={isLoading}
            />
            {/*
            <Icon
              style={styles.icon}
              raised
              type= "font-awesome"
              name= "hourglass"
              onPress={() => {getEta(); mapRef.current.fitToElements()}}
              loading={isLoading}
              disabled={isLoading}
            />
            */}
             </View>
             </View>
          <View style={styles.buttonContainer}>
              <ButtonE
                  title="Request Now"
                  buttonStyle={{backgroundColor: colors.orange}}
                  onPress={() => addRequest()}
                  loading={isLoading}
                  disabled={isLoading}
                  raised
              />
            </View>
        </KeyboardAvoidingView>
      </View>
      </TouchableWithoutFeedback>
    );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
  },
  inputContainer: {
    //height: hp("7.5%"),
    justifyContent: "space-between",
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  inputStyle: {
    marginLeft: 20,
    marginRight: 20,
  },
  containerStyle: {
    paddingLeft: 0,
    paddingRight: 0
  },
  inputContainerStyleTop: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  inputContainerStyleBottom: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    right: 75,
    left: 75,
  },
  mapStyle: {
    marginTop: 0,
    width: Dimensions.get('window').width,
    height: hp("90%"),
    justifyContent: 'space-between'
  },
  icons: {
    marginTop: 10,
    left: 315,
  },
  icon: {
    paddingVertical: 10,
    position: "absolute",
  },
});
