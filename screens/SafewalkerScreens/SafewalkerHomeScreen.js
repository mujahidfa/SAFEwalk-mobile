import React, { useState, useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, View, FlatList, totalResults, Alert  } from "react-native";

// 3rd party libraries
import Swipeable from "react-native-gesture-handler/Swipeable";
import moment from "moment/moment.js";
import Icon from 'react-native-vector-icons/FontAwesome';

// Constants
import socket from "./../../contexts/socket";
import colors from "./../../constants/colors";
import url from "./../../constants/api";
import TextInput from "./../../components/TextInput";
import Button from "./../../components/Button";
import style from "./../../constants/style";


// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

export default function SafewalkerHomeScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const { userToken, email } = useContext(AuthContext);
  const { setUserInfo, setCoordinates, setWalkAsActive } = useContext(WalkContext);

  /**
   * This effect sets up the socket connection to the User to listen to new walk requests.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    // this is to fix memory leak error: Promise cleanup
    const loadWalkAbortController = new AbortController();
    const signal = loadWalkAbortController.signal;
    askNotification();
    loadWalk(signal);

    socket.removeAllListeners();

    /**
     * Listen for new walk request signals (status will be true upon new requests)
     * Every time a new walk request signal is received,
     * we retrieve the latest walk requests from the database.
     */
    socket.on("walk status", (status) => {
      if (status) {
        loadWalk(signal);
      }
    });

    // cleanup
    return () => {
      socket.off("walk status", null);
      loadWalkAbortController.abort();
    };
  }, []);

  /* Notification Setup
askNotification (only for starting screens): Asks iOS for notification permissions
*/

  const askNotification = async () => {
    // We need to ask for Notification permissions for ios devices
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (Constants.isDevice && status === 'granted')
      console.log('Notification permissions granted.');
  };

  /**
   * Loads the walk requests from the database and fills them in local state (i.e. in "requests")
   *
   * @param signal cancels the fetch request when component is unmounted.
   */
  async function loadWalk(signal) {
    // Get Walks API
    // Retrieve the walk requests from the database
    const res = await fetch(url + "/api/Walks", {
      method: "GET",
      headers: {
        token: userToken,
        email: email,
      },
      signal: signal,
    }).catch((error) => {
      // cancel fetch upon component unmount
      if (signal.aborted) {
        return; // exit
      }
      console.error(
        "Error in fetching walk requests from loadWalk() in SafewalkerHomeScreen:" +
        error
      );
    });

    if (res == null) {
      return; // exit
    }

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "get walk requests in loadWalk() in SafewalkerHomeScreen failed: status " +
        status
      );
      return; //exit
    }

    // We fill up local state with formatted data
    const data = await res.json();
    let walks = [];
    for (const walk of Object.entries(data)) {
      walks.push({
        id: walk[1]["id"],
        username: walk[1]["userEmail"],
        time: walk[1]["time"],
        startText: walk[1]["startText"],
        endText: walk[1]["destText"],
      });
    }
    setRequests(walks);
  }

  /**
   * Upon swipe, the SAFEwalker accept the walk request.
   *
   * @param walkId the id of the walk to be accepted
   */
  async function acceptRequest(walkId) {
    // Get Walk Status API call
    // Check if walk request specified by walkId has been accepted
    const res = await fetch(url + "/api/Walks/" + walkId + "/status", {
      method: "GET",
      headers: {
        token: userToken,
        email: email,
        isUser: false,
      },
    }).catch((error) => {
      console.error(
        "Error in GET walk request in acceptRequest() in SafewalkerHomeScreen:" +
        error
      )
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "get walk status in acceptRequest() in SafewalkerHomeScreen failed: status " +
        status
      );
      return; // exit
    }

    const data = await res.json();
    // If walk is already assigned
    if (data !== 0) {
      alert("Unavailable");
      return; // exit
    }

    // Put Walk API call
    const res1 = await fetch(url + "/api/Walks/" + walkId, {
      method: "PUT",
      headers: {
        token: userToken,
        email: email,
        isUser: false,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: 1,
        walkerSocketId: socket.id,
      }),
    }).catch((error) => {
      console.error(
        "Error in PUT walk request in acceptRequest() in SafewalkerHomeScreen:" +
        error
      )
    });

    status = res1.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "accept walk in acceptRequest() in SafewalkerHomeScreen failed: status " +
        status
      );
      return; // exit
    }

    // Retrieve the user email and socket ID and store it in WalkContext
    // Then, set walk as active, and navigate to ActiveWalk screens
    const data1 = await res1.json();
    const userEmail = data1["userEmail"];
    const userSocketId = data1["userSocketId"];
    const startLat = data1["startLat"];
    const startLng = data1["startLng"];
    const destLat = data1["destLat"];
    const destLng = data1["destLng"];

    // Let user know request has been accepted
    socket.emit("walker walk status", { userId: userSocketId, status: 1 });
    // let other Safewalkers know walk has been assigned to the current SAFEwalker
    socket.emit("walk status", true);

    setUserInfo(walkId, userEmail, userSocketId); // save walk info in WalkContext
    setCoordinates(startLat, startLng, destLat, destLng); // save coordinates in WalkContext
    setWalkAsActive(); // setting this will bring the navigation to ActiveWalk Screens
  }

  // used to close swipeable when canceling a delete request
  const swipeableRef = useRef(null);
  const closeSwipeable = () => {
    swipeableRef.current.close();
  }

  /**
   * Helper function for swipe to delete. Adds in the confirm to delete functionality.
   *
   * Calls deleteRequest upon confirm
   * Closes the swipeable upon cancel
   *
   * @param request the request to either be deleted or closed
   */
  function deleteRequest2(request) {
    Alert.alert(
      'Deny SAFEwalk Request',
      '',
      [
        {text: 'Deny', onPress: () => deleteRequest(request.id)},
        {text: 'Cancel', onPress: () => closeSwipeable()},
      ],
      { cancelable: false }
    )
  }

  /**
   * Upon swipe, deletes the walk request.
   *
   * First, we delete the walk request in the database.
   * Next, we remove the walk request from the local walk request array.
   * Finally, we notify the User that their walk request has been rejected (using sockets).
   *
   * @param walkId the id of the walk to be deleted
   */
  async function deleteRequest(walkId) {
    // Delete Walk API call
    // Deletes the walk request in the database
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "DELETE",
      headers: {
        token: userToken,
        email: email,
        isUser: false,
      },
    }).catch((error) => {
      console.error(
        "Error in deleting walk request in deleteRequest() in SafewalkerHomeScreen:" +
        error
      )
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "delete walk request in deleteRequest() in SafewalkerHomeScreen failed: status " +
        status
      );
      return; // exit
    }

    const data = await res.json();
    const userSocketId = data["userSocketId"];

    // Remove the walk request with the corresponding walkId from local state
    setRequests((prevRequests) => {
      return prevRequests.filter((request) => request.id != walkId);
    });

    if (userSocketId != null) {
      // notify user that their walk request has been denied
      console.log("in socket in SW home screen");
      socket.emit("walker walk status", {
        userId: userSocketId,
        status: -1,
      });
    }
  }

  const LeftActions = () => {
    return (
      <View style={styles.LeftAction}>
        <Text style={styles.actionText}>Accept</Text>
      </View>
    );
  };

  const RightActions = () => {
    return (
      <View style={styles.RightAction}>
        <Text style={styles.actionText}>Deny</Text>
      </View>
    );
  };

  function trimEmail(userEmail) {
    var s = userEmail;
    s = s.substring(0, s.indexOf("@"));
    return s;
  }

  function requestCount() {
    var total = requests.length;
    return total;
  }

  const listEmptyComponent = () => (
    <View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 30,
          color: colors.orange,
          fontWeight: "bold",
          marginTop: 60,
        }}
      >

        </Text>
    </View>
  );

  const ListHeaderComponent = () => (
      <View style={styles.header}>
        <Text style={styles.textTitle}>
          <Text>Requests: </Text>
          <Text style={{fontWeight: "bold"}}>{requestCount()}</Text>
        </Text>
      </View>
  );


  function Item({ request, deleteRequest }) {
    return (
      <View style={styles.swipeable}>
        <Swipeable
          renderLeftActions={LeftActions}
          renderRightActions={RightActions}
          onSwipeableLeftOpen={() => acceptRequest(request.id)}
          onSwipeableRightOpen={() => deleteRequest2(request)}
          ref={swipeableRef}
        >
          <View style={styles.column}>
            <View style={styles.row}>
              <Text style={styles.name}>{trimEmail(request.username)}</Text>
              <Text style={styles.time}>
                {moment.utc(request.time).local().format("MMMM Do, h:mm a")}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "green", fontWeight: "bold", fontSize: 15, }}><Icon name="map-marker" size={15} color="green" />  </Text>
                <Text style={styles.location}>{request.startText}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "red", fontWeight: "bold", fontSize: 15,}}><Icon name="map-marker" size={15} color="red" />  </Text>
                <Text style={styles.location}>{request.endText}</Text>
              </View>
            </View>
          </View>
        </Swipeable>
      </View>
    );
  }

  // sort array of walk requests
  return (
    <View style={styles.container}>
      <FlatList
        data={requests.sort(function (a, b) {
          var dateA = new Date(a.time),
            dateB = new Date(b.time);
          return dateA - dateB;
        })}
        keyExtractor={(request, index) => index.toString()}
        totalResults={totalResults}
        ListEmptyComponent={() => listEmptyComponent()}
        ListHeaderComponent={() => ListHeaderComponent()}
        renderItem={({ item }) => (
          <Item request={item} deleteRequest={deleteRequest} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  swipeable: {
    borderBottomWidth: 3,
    borderColor: "#e8e8e8",
  },
  container: {
    borderTopWidth: 2,
    borderColor: "#e8e8e8",
    flex: 1,
    backgroundColor: "#fff",
  },
  column: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: "column",
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  location: {
    fontSize: 15,
    color: "grey",
  },
  time: {
    fontSize: 15,
    color: "grey",
  },
  LeftAction: {
    backgroundColor: "#388e3c",
    justifyContent: "center",
    width: "100%",
  },
  RightAction: {
    backgroundColor: "#dd2c00",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    padding: 20,
  },
  header: {
    backgroundColor: "#e8e8e8",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    height: '50%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textTitle: {
    color: colors.darkgray,
    fontSize: 16,
    justifyContent: "flex-start",
    marginLeft: 15,
    padding: 1
  },
});
