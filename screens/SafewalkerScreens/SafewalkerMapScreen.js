import React, { useState, useEffect, useContext, useRef } from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
} from "react-native";

import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Custom components
import Button from "./../../components/Button";
import Spacer from "./../../components/Spacer";

// Constants
import colors from "../../constants/colors";
import socket from "../../contexts/socket";
import url from "./../../constants/api";
import style from "./../../constants/style";

// Contexts
import { AuthContext } from "../../contexts/AuthProvider";
import { WalkContext } from "../../contexts/WalkProvider";

import MapView, { Marker, PROVIDER_GOOGLE, fitToElements } from "react-native-maps";

export default function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, email } = useContext(AuthContext);
  const { walkId, startLat, startLng, destLat, destLng, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  /**
   * Upon complete button press, update the current walk status in the database as completed
   * If successful,
   *  - we emit a message to the User that walk has been completed,
   *  - we remove all walk data from Context, and
   *  - we navigate back to home screen.
   */
  async function completeWalk() {
    // Put Walk API call
    // Update walk status in database as completed
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "PUT",
      headers: {
        token: userToken,
        email: email,
        isUser: false,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: 2,
      })
    }).catch((error) => {
      console.error(
        "Error in PUT walk request in completeWalk() in SafewalkerHomeScreen:" +
        error
      )
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "complete walk in completeWalk() in SafewalkerMapScreen failed: status " +
        status
      );
      return; //exit
    }

    // Upon fetch success
    if (userSocketId != null) {
      // Let user know walk has been completed
      socket.emit("walker walk status", {
        userId: userSocketId,
        status: 2,
      });
    }

    // walk is done, so wereset the walk state and return to InactiveWalk screens.
    resetWalkContextState();
  }

  const mapRef = useRef(null);
  const pinColor = ["green", "red", "blue"];

  const [destination, setDestination] = useState({
    coordinates: {
      latitude: destLat,
      longitude: destLng
    },
    text: "Destination"
  });

  // walk origin
  const [start, setStart] = useState({
    coordinates: {
      latitude: startLat,
      longitude: startLng
    },
    text: "Current Location"
  });

  const [user, setUser] = useState({
    coordinates: {
      latitude: 43.075143,
      longitude: -89.400151
    },
    text: "User"
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
        latitude: destination.coordinates.latitude,
        longitude: destination.coordinates.longitude
      }
    },
    // {
    //   key: 2,
    //   title: 'User',
    //   coordinates: {
    //     latitude: user.coordinates.latitude,
    //     longitude: user.coordinates.longitude
    //   }
    // }
  ]);

  const [userMarker, setUserMarkekr] = useState(
    {
      title: 'User',
      coordinates: {
        latitude: user.coordinates.latitude,
        longitude: user.coordinates.longitude
      }
    }
  );

  // /**
  //  * This effect sets up the socket connection to the User.
  //  * This effect is run once upon component mount.
  //  */
  useEffect(() => {
    socket.removeAllListeners();

    // socket to listen to user status change
    socket.on("user walk status", (status) => {
      console.log("user walk status in SWMapScreen:" + status);

      switch (status) {
        // User cancelled the walk
        case -2:
          // walk has ended, we reset the walk state and return to InactiveWalk screens
          resetWalkContextState();
          alert("The SAFEwalker canceled the walk.");
          break;

        default:
          console.log(
            "Unexpected socket status received in SafewalkerMapScreen: status " +
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

    // socket cleanup
    return () => {
      socket.off("user walk status", null);
      socket.off("connection lost", null);
    };
  }, []);

  async function onMapReady() {
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
        <MapView.Marker
          coordinate={{
            latitude: userMarker.coordinates.latitude,
            longitude: userMarker.coordinates.longitude
          }}
          title={userMarker.title}
          icon={require('../../assets/walking-solid.png')}
        />
      </MapView>
      {/* User Start and End Location input fields */}
      <View style={styles.buttonContainer}>
        <Button
        title="Mark walk as complete"
        loading={isLoading}
        disabled={isLoading}
        onPress={() => completeWalk()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 75,
    left: 75,
  },
  mapStyle: {
    marginTop: 0,
    width: Dimensions.get('window').width,
    height: hp("81%"),
    justifyContent: 'space-between'
  },
});
