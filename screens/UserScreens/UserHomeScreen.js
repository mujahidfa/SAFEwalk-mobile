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
import { Input, Icon } from "react-native-elements";
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

  const getDestinationCoordinates = text => {
    var replaced = text.split(' ').join('+');
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + replaced + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
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

  const getStartAddress = coordinates => {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
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

  const getDestinationAddress = coordinates => {
    var axiosURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + ", " + coordinates.longitude + "&key=AIzaSyAOjTjRyHvY82Iw_TWRVGZl-VljNhRYZ-c";
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

  async function convertEta() {
    var today = new Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <View style={styles.container}>
           <View style={styles.innerContainer}>
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
                }}
                rightIcon={{
                  type: "font-awesome",
                  name: "location-arrow",
                  onPress: () => {currentAsStart(); mapRef.current.fitToElements()}
                }}
              />
            </View>
            <View style={styles.inputContainer}>
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
              }}
              rightIcon={{
                type: "font-awesome",
                name: "home",
                onPress: () => {homeAsDest(); mapRef.current.fitToElements()}
              }}
            />
          </View>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            showsUserLocation={true}
            ref={mapRef}
            minZoomLevel={10}
            maxZoomLevel={15}
            onMapReady={onMapReady}
          >
            <Icon
              raised
              type= "font-awesome"
              name= "hourglass"
              onPress={() => {getEta(); mapRef.current.fitToElements()}}
              loading={isLoading}
              disabled={isLoading}
            />
            <Text style={styles.etaText}>  ETA: {eta}</Text>
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
          <View style={styles.buttonContainer}>
            <Button
                title="Request Now"
                onPress={() => addRequest()}
                loading={isLoading}
                disabled={isLoading}
            />
          </View>
        </View>
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
    justifyContent: "center",
  },
  inputContainer: {
    height: hp("7.5%"),
    justifyContent: "flex-end",
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
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 2,
  },
  inputContainerStyleBottom: {
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 2,
    marginBottom: 20
  },
  buttonContainer: {
    height: hp("17%"),
    justifyContent: "space-around",
  },
  mapStyle: {
    marginTop:0,
    width: Dimensions.get('window').width,
    height: hp("60%"),
    justifyContent: 'space-between'
  },
  etaText: {
    textAlign: 'right',
    marginRight: 10,
    marginBottom: 10
  }
});
