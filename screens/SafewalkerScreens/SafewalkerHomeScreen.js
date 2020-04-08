import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, AsyncStorage } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { AuthContext } from "./../../contexts/AuthProvider";
import socket from "./../../contexts/socket";
//import { moment} from "moment";
import moment from 'moment/moment.js';

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout, userToken, email } = useContext(AuthContext);
  const [items, setItems] = React.useState([]);

  async function LoadWalk() {
    // GetWalks API, setItems
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks",
      {
        method: "GET",
        headers: {
          token: userToken,
          email: email
        }
      }
    );
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("get walks failed: status " + status);
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
        endText: walk[1]["destText"]
      });
    }

    setItems(walks);
  }

  async function cleanUpStorage() {
    // remove all current walk-related information
    await AsyncStorage.removeItem('walkId');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSocketId');
  }

  useEffect(() => {
    LoadWalk();

    socket.on("walk status", status => {
      console.log(status);
      if (status) LoadWalk();
    });

    return () => socket.off("walk status", null);
  }, []);

  async function acceptRequest(id) {
    // putWalk API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks/' + id, {
      method: 'PUT',
      headers: {
        'token': userToken,
        'email': email,
        'isUser': false,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 1,
        walkerSocketId: socket.id
      })
    });
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("accept walk failed: status " + status);
      return;
    }

    const data = await res.json();
    const userEmail = data['userEmail'];
    const userSocketId = data['userSocketId'];

    // Let user know request has been accepted
    socket.emit("walker walk status", { userId: userSocketId, status: 1 }); // send notification to user
    // let other Safewalker know walk has been assigned
    socket.emit('walk status', true);

    // store data 
    await AsyncStorage.setItem('walkId', id);
    await AsyncStorage.setItem('userEmail', userEmail);
    await AsyncStorage.setItem('userSocketId', userSocketId);

    //navigate to tab
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "SafewalkerTab"
        }
      ]
    });
  }

  async function deleteItem(id) {
    setItems(prevItems => {
      return prevItems.filter(item => item.id != id);
    });

    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: false
        }
      }
    );
    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
      return;
    }

    const data = await res.json();
    const userSocketId = data['userSocketId'];

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

  function Item({ item, onPress, deleteItem }) {
    return (
      <View style={styles.swipeable}>
        <Swipeable
          renderLeftActions={LeftActions}
          renderRightActions={RightActions}
          onSwipeableLeftOpen={() => acceptRequest(item.id)}
          onSwipeableRightOpen={() => deleteItem(item.id)}
        >
          <View style={styles.column}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.time}>{moment.utc(item.time).format('MMMM Do, h:mm a')}</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "green", fontWeight: "bold" }}>A: </Text>
                <Text style={styles.location}>{item.startText}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: "red", fontWeight: "bold" }}>B: </Text>
                <Text style={styles.location}>{item.endText}</Text>
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
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Item item={item} deleteItem={deleteItem} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  swipeable: {
    borderBottomWidth: 3,
    borderColor: "#e8e8e8"
  },
  container: {
    borderTopWidth: 2,
    borderColor: "#e8e8e8",
    flex: 1,
    backgroundColor: "#fff"
    //alignItems: "center",
    //justifyContent: "center"
  },
  column: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: "column",
    backgroundColor: "#fff",
    justifyContent: "flex-start"
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6
  },
  name: {
    fontSize: 17,
    fontWeight: "600"
  },
  location: {
    fontSize: 15,
    color: "grey"
  },
  time: {
    fontSize: 13,
    color: "grey"
  },
  LeftAction: {
    backgroundColor: "#388e3c",
    justifyContent: "center",
    width: "100%"
  },
  RightAction: {
    backgroundColor: "#dd2c00",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%"
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    padding: 20
  }
});
