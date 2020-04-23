import React, { useState, useEffect, useContext, useRef } from "react";
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

export default function UserMapScreen({ navigation }) {
  const { resetWalkContextState } = useContext(WalkContext);

  const mapRef = useRef(null);
  const pinColor = ["green", "red", "blue"]

  const [destination, setDestination] = useState({
    coordinates: {
      latitude: +43.081606,
      longitude: -89.376298
    },
    text: "Destination"
  });

  // walk origin - default to current location
  const [start, setStart] = useState({
    coordinates: {
      latitude: 43.075143,
      longitude: -89.400151
    },
    text: "Start"
  });

  const [safewalker, setSafewalker] = useState({
    coordinates: {
      latitude: 43.075143,
      longitude: -89.400151
    },
    text: "SAFEwalker"
  });

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
        latitude: destination.coordinates.latitude,
        longitude: destination.coordinates.longitude
      }
    },
    {
      key: 2,
      title: 'SAFEwalker',
      coordinates: {
        // replace with api to get user's home address
        latitude: safewalker.coordinates.latitude,
        longitude: safewalker.coordinates.longitude
      }
    }
  ]);


  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    socket.removeAllListeners();

    socket.on("walker location", ({ lat, lng }) => {
      console.log(lat + "," + lng);
      setSafewalker(
        {
          coordinates: {
            latitude: lat,
            longitude: lng
          },
          text: "SAFEwalker"
        }
      )
      mapRef.current.fitToElements();
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

    mapRef.current.fitToElements();
  };

  return (
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
    height: hp("100%"),
    justifyContent: 'space-between'
  },
});
