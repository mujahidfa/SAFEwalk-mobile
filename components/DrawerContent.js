import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerItem,
  DrawerItemList,
  DrawerContentScrollView
} from "@react-navigation/drawer";

import { AuthContext } from "./../contexts/AuthProvider";

export default function DrawerContent(props) {
  const { signout } = useContext(AuthContext);

  return (
    <DrawerContentScrollView>
      <View style={styles.container}>
        <DrawerItemList {...props} />
        <DrawerItem label="Log out" onPress={() => signout()} />
      </View>
    </DrawerContentScrollView>
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
