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

  const locationRef = useRef(location);
  locationRef.current = location;

  function showLocation(position) {
    setLocation(
      {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        text: "Current Location"
      }
    );
    console.log("Current location: " + locationRef.current.coordinates.latitude + ", " + locationRef.current.coordinates.longitude);
 }

  // destination
  const [destination, setDestination] = useState({
    coordinates: {
      latitude: 43.071974,
      longitude: -89.408064
    },
    text: ""
  });

  const destinationRef = useRef(destination);
  destinationRef.current = destination;

  // walk origin - default to current location
  const [start, setStart] = useState({
    coordinates: {
      latitude: locationRef.current.coordinates.latitude,
      longitude: locationRef.current.coordinates.longitude
    },
    text: "Current Location"
  });

  const startRef = useRef(start);
  startRef.current = start;

  const [startMarker, setStartMarker] = useState(
    {
      title: 'Start',
      coordinates: {
        latitude: locationRef.current.coordinates.latitude,
        longitude: locationRef.current.coordinates.longitude
      }
    }
  );

  const startMarkerRef = useRef(startMarker);
  startMarkerRef.current = startMarker;

  const [destMarker, setDestMarker] = useState(
    {
      title: 'Destination',
      coordinates: {
        latitude: destinationRef.current.coordinates.latitude,
        longitude: destinationRef.current.coordinates.longitude
      }
    }
  );

  const destMarkerRef = useRef(destMarker);
  destMarkerRef.current = destMarker;

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

    console.log(destinationRef.current.text);

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
        startText: startRef.current.text,
        startLat: startRef.current.coordinates.latitude,
        startLng: startRef.current.coordinates.longitude,
        destText: destinationRef.current.text,
        destLat: destinationRef.current.coordinates.latitude,
        destLng: destinationRef.current.coordinates.longitude,
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
      startRef.current.coordinates.latitude + '',
      startRef.current.coordinates.longitude + '',
      destinationRef.current.coordinates.latitude + '',
      destinationRef.current.coordinates.longitude + ''
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
          latitude: startRef.current.coordinates.latitude,
          longitude: startRef.current.coordinates.longitude
        },
        text: location
      });
    } else {
      setValue("endLocation", location, true);
      setDestination({
        coordinates: {
          latitude: destinationRef.current.coordinates.latitude,
          longitude: destinationRef.current.coordinates.longitude
        },
        text: location
      });
    }
  };

  function onStartTextChange(textValue) {
    setStart({
      coordinates: {
        latitude: startRef.current.coordinates.latitude,
        longitude: startRef.current.coordinates.longitude
      },
      text: textValue
    });
  }

  function onDestinationTextChange(textValue) {
    setDestination({
      coordinates: {
        latitude: destinationRef.current.coordinates.latitude,
        longitude: destinationRef.current.coordinates.longitude
      },
      text: textValue
    });
  }

  function getStartCoordinates(text) {
    if(text == "Current Location") {
      navigator.geolocation.getCurrentPosition(showLocation);
      setStart({
        coordinates: {
          latitude: locationRef.current.coordinates.latitude,
          longitude: locationRef.current.coordinates.longitude
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

  function getDestinationCoordinates(text) {
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

  function getStartAddress(coordinates) {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
    .then(res => {
      setStart({
        coordinates: {
          latitude: startRef.current.coordinates.latitude,
          longitude: startRef.current.coordinates.longitude
        },
        text: res.data.results[0].formatted_address
      })
      return(res.data.results[0].formatted_address);
    })
  }

  function getDestinationAddress(coordinates) {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
    .then(res => {
      setDestination({
        coordinates: {
          latitude: destinationRef.current.coordinates.latitude,
          longitude: destinationRef.current.coordinates.longitude
        },
        text: res.data.results[0].formatted_address
      })
      return(res.data.results[0].formatted_address);
    })
  }

  function updateStart() {

    getStartCoordinates(startRef.current.text);

    changeLocation("start", startRef.current.text);

    setStartMarker({
      title: 'Start',
      coordinates: {
        latitude: startRef.current.coordinates.latitude,
        longitude: startRef.current.coordinates.longitude
      }
    })
  }

  function updateDestination() {

    getDestinationCoordinates(destinationRef.current.text);

    changeLocation("destination", destinationRef.current.text);

    setDestMarker({
      title: 'Destination',
      coordinates: {
        latitude: destinationRef.current.coordinates.latitude,
        longitude: destinationRef.current.coordinates.longitude
      }
    })

  }

  function currentAsStart() {

    navigator.geolocation.getCurrentPosition(showLocation);

    setStart({
      coordinates: {
        latitude: locationRef.current.coordinates.latitude,
        longitude: locationRef.current.coordinates.longitude
      },
      text: "Current Location"
    });
    setStartMarker({
      title: 'Start',
      coordinates: {
        latitude: locationRef.current.coordinates.latitude,
        longitude: locationRef.current.coordinates.longitude
      }
    })

    changeLocation("start", startRef.current.text);
  }

  function onMapReady() {
    currentAsStart();
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
            ref={mapRef}
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
            <MapView.Marker
              coordinate={{
                latitude: startMarkerRef.current.coordinates.latitude,
                longitude: startMarkerRef.current.coordinates.longitude
              }}
              title={startMarkerRef.current.title}
              pinColor={pinColor[0]}
            />
            <MapView.Marker
              coordinate={{
                latitude: destMarkerRef.current.coordinates.latitude,
                longitude: destMarkerRef.current.coordinates.longitude
              }}
              title={destMarkerRef.current.title}
              pinColor={pinColor[1]}
            />
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
                value={startRef.current.text}
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
                value={destinationRef.current.text}
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
