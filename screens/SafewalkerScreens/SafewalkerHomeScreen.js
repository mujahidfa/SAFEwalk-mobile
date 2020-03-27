import React, { useContext, useEffect, Component } from "react";
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, useState, Icon, AsyncStorage } from "react-native";
import { ListItem, List } from 'react-native-elements';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { AuthContext } from "./../../contexts/AuthProvider";
import { render } from "react-dom";
import io from "socket.io-client";
import socket from "./../../contexts/socket";

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout } = useContext(AuthContext);
  const [items, setItems] = React.useState([]);

  async function LoadWalk() {
    // GetWalks API, setItems 
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks', {
      method: 'GET',
      headers: {
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEyMzQ1Njc4OTg3NjVoYyIsIm5iZiI6MTU4Mzc2NTE1MCwiZXhwIjoxNTgzODUxNTUwLCJpYXQiOjE1ODM3NjUxNTB9.lIqN2RuvbOK79Succ98r3DnlDa59MfahHddfNMyArsA',
        'email': 'shimura@wisc.edu',
      }
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("get walks failed: status " + status);
      return;
    }

    const data = await res.json();
    let walks = [];
    for (const walk of Object.entries(data)) {
      walks.push({
        'id': walk[1]['id'],
        'username': walk[1]['userEmail'],
        'time': walk[1]['time'],
        'startText': walk[1]['startText'],
        'endText': walk[1]['destText'],
      });
    }

    setItems(walks);
  }

  async function setSocketId(socketId) {
    const walkerEmail = 'shimura@wisc.edu';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEyMzQ1Njc4OTg3NjVoYyIsIm5iZiI6MTU4Mzc2NTE1MCwiZXhwIjoxNTgzODUxNTUwLCJpYXQiOjE1ODM3NjUxNTB9.lIqN2RuvbOK79Succ98r3DnlDa59MfahHddfNMyArsA';

    // PutSafewalker API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Safewalkers/' + walkerEmail, {
      method: 'PUT',
      headers: {
        'token': token,
        'email': walkerEmail,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        socketId: socketId
      })
    });

    const status = res.status;
    if (status != 200 && status != 201) {
      console.log("set socketId failed: status " + status);
      return;
    }
  }

  useEffect(() => {
    setSocketId(socket.id);

    LoadWalk();

    socket.on("walk status", status => {
      console.log(status);
      if (status) LoadWalk();
    });

    
    // socket to listen to user status change
    socket.on('user walk status', status => {
      console.log(status);
      
      switch (status) {
        case -2:
          navigation.navigate('SafewalkerHome');
          alert('The user canceled the walk.');
          break;
      }
    });
  }, []);

  async function acceptRequest(id) {
    // putWalk API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks/' + id, {
      method: 'PUT',
      headers: {
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEyMzQ1Njc4OTg3NjVoYyIsIm5iZiI6MTU4Mzc2NTE1MCwiZXhwIjoxNTgzODUxNTUwLCJpYXQiOjE1ODM3NjUxNTB9.lIqN2RuvbOK79Succ98r3DnlDa59MfahHddfNMyArsA',
        'email': 'shimura@wisc.edu',
        'isUser': false,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 1
      })
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("accept walk failed: status " + status);
      return;
    }

    const data = await res.json();
    let userEmail = data['userEmail'];

    await AsyncStorage.setItem('userEmail', userEmail);
    await AsyncStorage.setItem('walkId', id);

    socket.emit('walk status', true);

    //navigate to tab
    navigation.navigate("SafewalkerTab");
  }

  async function deleteItem(id) {
    setItems((prevItems) => {
      return prevItems.filter(item => item.id != id);
    });

    // DeleteWalk API call
    const res = await fetch('https://safewalkapplication.azurewebsites.net/api/Walks/' + id, {
      method: 'DELETE',
      headers: {
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEyMzQ1Njc4OTg3NjVoYyIsIm5iZiI6MTU4Mzc2NTE1MCwiZXhwIjoxNTgzODUxNTUwLCJpYXQiOjE1ODM3NjUxNTB9.lIqN2RuvbOK79Succ98r3DnlDa59MfahHddfNMyArsA',
        'email': 'shimura@wisc.edu',
        'isUser': false
      }
    });

    let status = res.status;
    if (status != 200 && status != 201) {
      console.log("delete walk failed: status " + status);
      return;
    }

    const data = await res.json();
    const userEmail = data['userEmail'];

    console.log(userEmail);

    // GetUser API - to get socket id
    const res1 = await fetch('https://safewalkapplication.azurewebsites.net/api/Users/' + userEmail, {
      method: 'GET',
      headers: {
        'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEyMzQ1Njc4OTg3NjVoYyIsIm5iZiI6MTU4Mzc2NTE1MCwiZXhwIjoxNTgzODUxNTUwLCJpYXQiOjE1ODM3NjUxNTB9.lIqN2RuvbOK79Succ98r3DnlDa59MfahHddfNMyArsA',
        'email': 'shimura@wisc.edu',
        'isUser': false
      }
    });

    status = res1.status;
    if (status != 200 && status != 201) {
      console.log("get user failed: status " + status);
      return;
    }

    const data1 = await res1.json();
    console.log(data1);
    const userSocketId = data1['socketId'];
    
    console.log(userSocketId);

    // notify user request has been denied
    socket.emit("walker walk status", { userId: userSocketId, status: -1 }); 
  };

  const LeftActions = () => {
    return (
      <View style={styles.LeftAction}>
        <Text style={styles.actionText}>Accept</Text>
      </View>
    )
  };

  const RightActions = () => {
    return (
      <View style={styles.RightAction}>
        <Text style={styles.actionText}>Deny</Text>
      </View>
    )
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
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>A: </Text>
                <Text style={styles.location}>{item.startText}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>B: </Text>
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
        renderItem={({ item }) => (
          <Item item={item} deleteItem={deleteItem} />
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  swipeable: {
    borderBottomWidth: 3,
    borderColor: '#e8e8e8',
  },
  container: {
    borderTopWidth: 2,
    borderColor: '#e8e8e8',
    flex: 1,
    backgroundColor: "#fff",
    //alignItems: "center",
    //justifyContent: "center"
  },
  column: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: 'column',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  location: {
    fontSize: 15,
    color: 'grey'
  },
  time: {
    fontSize: 13,
    color: 'grey'
  },
  LeftAction: {
    backgroundColor: '#388e3c',
    justifyContent: 'center',
    width: '100%'
  },
  RightAction: {
    backgroundColor: '#dd2c00',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%'
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    padding: 20
  }
});
