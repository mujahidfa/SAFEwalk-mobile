import React, { useState, useEffect, useContext, useRef } from "react";
import axios from 'axios';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
} from "react-native";
import socket from "../../contexts/socket";

import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { WalkContext } from "./../../contexts/WalkProvider";
import MapView, { Marker, PROVIDER_GOOGLE, fitToElements } from "react-native-maps";

// constants
import colors from "./../../constants/colors";
import { Card } from "react-native-paper";

export default function UserMapScreen({ navigation }) {
  const { startLat, startLng, destLat, destLng, resetWalkContextState } = useContext(WalkContext);

  const mapRef = useRef(null);
  const pinColor = ["green", "red", "blue"]

  const [location, setLocation] = useState({
    coordinates: {
      latitude: 43.081606,
      longitude: -89.376298
    },
    text: ""
  });

  console.log(startLat + ", " + startLng);

  const [destination, setDestination] = useState({
    coordinates: {
      latitude: parseFloat(destLat),
      longitude: parseFloat(destLng)
    },
    text: "Destination"
  });

  // walk origin - default to current location
  const [start, setStart] = useState({
    coordinates: {
      latitude: parseFloat(startLat),
      longitude: parseFloat(startLng)
    },
    text: "Start"
  });

  const [safewalker, setSafewalker] = useState({
    coordinates: {
      latitude: start.coordinates.latitude,
      longitude: start.coordinates.longitude
    },
    text: "SAFEwalker"
  });

  const [startMarker, setStartMarker] = useState(
    {
      title: 'Start',
      coordinates: {
        latitude: start.coordinates.latitude,
        longitude: start.coordinates.longitude
      }
    }
  );

  const [destMarker, setDestMarker] = useState(
    {
      title: 'Destination',
      coordinates: {
        latitude: destination.coordinates.latitude,
        longitude: destination.coordinates.longitude
      }
    }
  );

  const [walkerMarker, setWalkerMarker] = useState(
    {
      title: 'SAFEwalker',
      coordinates: {
        // replace with api to get user's home address
        latitude: safewalker.coordinates.latitude,
        longitude: safewalker.coordinates.longitude
      }
    }
  );

  const [duration, setDuration] = useState("0 minutes");
  const [distance, setDistance] = useState("0");
  const [eta, setEta] = useState("0");

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

  async function getEta() {
    navigator.geolocation.getCurrentPosition(showLocation);
    var axiosURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + location.coordinates.latitude + ", " + location.coordinates.longitude + "&destinations=" + safewalker.coordinates.latitude + ", " + safewalker.coordinates.longitude + "&mode=walking&key=AIzaSyAIzBUtTCj7Giys9FaOu0EZMh6asAx7nEI";
    axios.get(axiosURL)
      .then(res => {
        console.log(res);
        setDuration(res.data.rows[0].elements[0].duration.text);
        setDistance(res.data.rows[0].elements[0].distance.text);
        convertEta();
      })
  }

  async function convertEta() {
    var today = new Date();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var replaced = duration.split(' ');
    if (replaced[1].localeCompare("hours") == 0) {
      hours = parseInt(hours) + parseInt(replaced[0]);
      minutes = parseInt(minutes) + parseInt(replaced[2]);
    }
    else {
      minutes = parseInt(minutes) + parseInt(replaced[0]);
    }

    if (minutes > 59) {
      minutes = parseInt(minutes) - 60;
      hours = parseInt(hours) + 1;
    }
    if (hours > 23) {
      hours = parseInt(hours) - 24;
    }

    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var returnString = hours + ":" + minutes;
    setEta(returnString);
  }

  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    socket.removeAllListeners();

    socket.on("walker location", ({ lat, lng }) => {
      console.log(lat + "," + lng);
      // setSafewalker(
      //   {
      //     coordinates: {
      //       latitude: lat,
      //       longitude: lng
      //     },
      //     text: "SAFEwalker"
      //   }
      // );
      setWalkerMarker({
        title: 'SAFEwalker',
        coordinates: {
          // replace with api to get user's home address
          latitude: lat,
          longitude: lng
        }
      })
      // mapRef.current.fitToElements();
    });

    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      switch (status) {
        // SAFEwalker has canceled the walk
        case -2:
          // reset walk state to change navigation to InactiveWalk Screens
          resetWalkContextState();
          alert("The SAFEwalker has canceled the walk.");
          break;
        // walk has been marked as completed by the SAFEwalker
        case 2:
          resetWalkContextState();
          alert("The walk has been completed!");
          break;

        default:
          console.log(
            "Unexpected socket status received in UserMapScreen: status " +
            status
          );
      }
    });

    socket.on("connection lost", (status) => {
      if (status) {
        alert("Connection Lost");
        // TODO: button to cancel walk, call cancelWalk()
      }
    });

    // cleanup socket
    return () => {
      socket.off("walker location", null);
      socket.off("walker walk status", null);
      socket.off("connection lost", null);
    };
  }, []);

  async function onMapReady() {
    // GET SAFEwalker coordinates
    getEta();
    convertEta();
    // mapRef.current.fitToElements();
  };

  return (
    <View style={styles.container}>
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
        <MapView.Marker
          coordinate={{
            latitude: startMarker.coordinates.latitude,
            longitude: startMarker.coordinates.longitude
          }}
          title={startMarker.title}
          pinColor={pinColor[0]}
        />
        <MapView.Marker
          coordinate={{
            latitude: destMarker.coordinates.latitude,
            longitude: destMarker.coordinates.longitude
          }}
          title={destMarker.title}
          pinColor={pinColor[1]}
        />
        <MapView.Marker
          coordinate={{
            latitude: walkerMarker.coordinates.latitude,
            longitude: walkerMarker.coordinates.longitude
          }}
          title={walkerMarker.title}
          icon={require('../../assets/walking-solid.png')}
        />
        <View styles={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.textStyle1}>
            ETA: {duration}
          </Text>
          <Text style={styles.textStyle2}>
            Distance: {distance}
          </Text>
        </View>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    marginTop: 0,
    width: Dimensions.get('window').width,
    height: hp("83%"),
    justifyContent: 'flex-start'
  },
  textStyle1: {
    fontWeight: 'bold',
    color: colors.darkgray,
    marginTop: 15,
    marginLeft: 10,
    fontSize: 18,
  },
  textStyle2: {
    fontWeight: 'bold',
    color: colors.darkgray,
    marginTop: 5,
    marginLeft: 10,
    fontSize: 18,
  }
});
