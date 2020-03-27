import React, { useContext, Component, useEffect} from "react";
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, useState, Icon, ActivityIndicator } from "react-native";
import { ListItem, List} from 'react-native-elements';
import Swipeable from 'react-native-gesture-handler/Swipeable';


import { AuthContext } from "./../../contexts/AuthProvider";
import { render } from "react-dom";

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout } = useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);

  // Data is here for testing, once connected with backend this array should be empty
  const [request, setRequest] = React.useState([
    {id: 1, name: 'Katie', time: '1:30 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
    {id: 2, name: 'Alex', time: '1:17 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
    {id: 3, name: 'Yoon', time: '1:15 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
    {id: 4, name: 'Justin', time: '1:10 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
    {id: 5, name: 'Mujahid', time: '1:05 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
    {id: 6, name: 'Tadao', time: '1:00 ', date: '3/14/20', start: 'start:KK ', end: 'end:UU'},
  ]);

  // TODO: Pull requests from database
  useEffect(()=>{
    setLoading(true);
    // Pull here
    setLoading(false);
  } , []);

 
  // TODO: Implement pull down to refresh


  // TODO: change from button to full swipe to accept
  const LeftActions = () => {
    return (
      <View style={styles.LeftAction}>
      <TouchableOpacity
      onPress={() => navigation.navigate("SafewalkerTab")}
      >
        <Text style={styles.actionText}>Accept Request</Text>
      </TouchableOpacity>
      </View>
    )
  };

  // TODO: Implement swipe to delete
  // TODO: Add in confirm deletion pop up
  const RightActions = ({onPress, deleteItem, item}) => {
    return (
      <View style={styles.RightAction}>
      <TouchableOpacity 
        onPress={() => alert('Request Denied')}
      >
        <Text style={styles.actionText}>Deny Request</Text>
      </TouchableOpacity>
      </View>
    )
  };

  const deleteItem = id => {
    setRequest((prevItems) => {
      return prevItems.filter(item => item.id != id);
    });
  };

  // Each request is an Item
  function Item({item, onPress, deleteItem}) {
    return (
      <Swipeable
      renderLeftActions={LeftActions}
      renderRightActions={RightActions}
    >
    <View style={styles.row}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.location}>{item.start}{item.end}</Text>
      <Text style={styles.time}>{item.time}{item.date}</Text>
      <Button
      title = "Delete"
      onPress={() => deleteItem(item.id)}
      />
    </View>
    </Swipeable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={request}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Item item={item} deleteItem={deleteItem} />
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    //alignItems: "center",
    //justifyContent: "center"
  },
  row: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 15,
    flexDirection: 'row',
    borderColor: '#a9a9a9',
    borderBottomWidth: 2,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 25,
    flex: 2,
    fontWeight: '600',
  },
  location: {
    fontSize: 20,
    flex: 2,
  },
  time: {
    fontSize: 20,
    flex: 2,
  },
  LeftAction: {
    backgroundColor: '#388e3c',
    justifyContent: 'center',
  },
  RightAction: {
    backgroundColor: '#dd2c00',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    padding: 20
  }
});
