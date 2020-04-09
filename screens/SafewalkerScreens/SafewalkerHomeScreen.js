import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, AsyncStorage } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { AuthContext } from "./../../contexts/AuthProvider";
import socket from "./../../contexts/socket";
//import { moment} from "moment";
import moment from "moment/moment.js";

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout, userToken, email } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  async function loadWalk(signal) {
    // GetWalks API, setRequests
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks",
      {
        method: "GET",
        headers: {
          token: userToken,
          email: email,
        },
        signal: signal,
      }
    );
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("get walk requests failed: status " + status);
      return;
    }

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

  async function cleanUpStorage() {
    // remove all current walk-related information
    await AsyncStorage.removeItem("walkId");
    await AsyncStorage.removeItem("userEmail");
    await AsyncStorage.removeItem("userSocketId");
  }

  useEffect(() => {
    // this is to fix memory leak error: Promise cleanup
    const loadWalkAbortController = new AbortController();
    const signal = loadWalkAbortController.signal;

    loadWalk(signal).catch((error) => {
      if (error.name === "AbortError") return;

      console.error("Error in loadWalk() in SafewalkerHomeScreen:" + error);
    });

    socket.on("walk status", (status) => {
      console.log(status);
      if (status) loadWalk(signal);
    });

    return () => {
      socket.off("walk status", null);
      loadWalkAbortController.abort();
    };
  }, []);

  async function acceptRequest(id) {
    // GetWalkStatus API call - check if request has been accepted
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" +
        id +
        "/status",
      {
        method: "GET",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
        },
      }
    );
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("get walk status failed: status " + status);
      return;
    }

    const data = await res.json();
    if (data != 0) {
      alert("Unavailable");
      return;
    }

    // PutWalk API call
    const res1 = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
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
      }
    );
    status = res1.status;
    if (status != 200 && status != 201) {
      console.error("accept walk failed: status " + status);
      return;
    }

    const data1 = await res1.json();
    const userEmail = data1["userEmail"];
    const userSocketId = data1["userSocketId"];

    // Let user know request has been accepted
    socket.emit("walker walk status", { userId: userSocketId, status: 1 }); // send notification to user
    // let other Safewalker know walk has been assigned
    socket.emit("walk status", true);

    // store data
    await AsyncStorage.setItem("walkId", id);
    await AsyncStorage.setItem("userEmail", userEmail);
    await AsyncStorage.setItem("userSocketId", userSocketId);

    //navigate to tab
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "SafewalkerTab",
        },
      ],
    });
  }

  async function deleteRequest(id) {
    setRequests((prevRequests) => {
      return prevRequests.filter((request) => request.id != id);
    });

    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
        },
      }
    );
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
      return;
    }

    const data = await res.json();
    const userSocketId = data["userSocketId"];

    if (userSocketId) {
      // notify user request has been denied
      socket.emit("walker walk status", { userId: userSocketId, status: -1 });
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

  function Item({ request, deleteRequest }) {
    return (
      <View style={styles.swipeable}>
        <Swipeable
          renderLeftActions={LeftActions}
          renderRightActions={RightActions}
          onSwipeableLeftOpen={() => acceptRequest(request.id)}
          onSwipeableRightOpen={() => deleteRequest(request.id)}
        >
          <View style={styles.column}>
            <View style={styles.row}>
              <Text style={styles.name}>{request.username}</Text>
              <Text style={styles.time}>
                {moment.utc(request.time).format("MMMM Do, h:mm a")}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "green", fontWeight: "bold" }}>A: </Text>
                <Text style={styles.location}>{request.startText}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "red", fontWeight: "bold" }}>B: </Text>
                <Text style={styles.location}>{request.endText}</Text>
              </View>
            </View>
          </View>
        </Swipeable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(request, index) => index.toString()}
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
    //alignItems: "center",
    //justifyContent: "center"
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
    fontSize: 13,
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
});
