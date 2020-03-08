import React, { useContext, Component} from "react";
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from "react-native";
import { ListItem, List} from 'react-native-elements';
import Swipeable from 'react-native-gesture-handler/Swipeable';


import { AuthContext } from "./../../contexts/AuthProvider";
import { render } from "react-dom";

export default function SafewalkerHomeScreen({ navigation }) {
  const { signout } = useContext(AuthContext);

  const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'Katie B',
      name: 'kt',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Alex D',
      name: 'al',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Yoon C',
      name: 'yon',
    },
    {
      id: '12',
      title: 'test',
      name: 'test',
    },
    {
      id: '13',
      title: 'test',
      name: 'test',
    },
    {
      id: '14',
      title: 'test',
      name: 'test',
    },
    {
      id: '15',
      title: 'test',
      name: 'test',
    },
    {
      id: '16',
      title: 'test',
      name: 'test',
    },
    {
      id: '17',
      title: 'test',
      name: 'test',
    },
    {
      id: '18',
      title: 'test',
      name: 'test',
    }
  ];

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

  const RightActions = (onPress) => {
    return (
      <View style={styles.RightAction}>
      <TouchableOpacity 
      onPress={() => alert('pressed right!')}
      >
        <Text style={styles.actionText}>Deny Request</Text>
      </TouchableOpacity>
      </View>
    )
  };
  
  function Item({ title }) {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }

  const onRightPress = () => {
    alert('pressed right!')
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderLeftActions={LeftActions}
            renderRightActions={RightActions}
            //renderRightActions={() => <RightActions onPress={onRightPress}/>}
          >
          <View style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.location}>{item.name}</Text>
          </View>
          </Swipeable>
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
    borderBottomWidth: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
  },
  name: {
    fontSize: 30,
    flex: 1,
    justifyContent: 'flex-start',
  },
  location: {
    fontSize: 20,
    justifyContent: 'flex-end',
  },
  time: {
    fontSize: 20,
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
