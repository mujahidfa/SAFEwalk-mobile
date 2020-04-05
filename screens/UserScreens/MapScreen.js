import  React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import socket from "./../../contexts/socket";

export default function MapScreen({ navigation }) {
  useEffect(() => {
    // socket to listen to walker status change
    socket.on('walker walk status', status => {
      switch (status) {
        case -2:
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome"
              }
            ]
          });
          alert('The SAFEwalker has canceled the walk.');
          break;
        case 2:
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome"
              }
            ]
          });
          alert('The walk has been completed!');
          break;
      }
    });
  
    return () => socket.off("walker walk status", null);
  }, []);

  return (
    <View style={styles.container}>
      <Text>User Map Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
