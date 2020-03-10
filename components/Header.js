import React from "react";
import { Appbar } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import colors from "./../constants/colors";

export default function Header({ scene, navigation }) {
  const { options } = scene.descriptor;
  const title =
    options.headerTitle !== undefined
      ? options.headerTitle
      : options.title !== undefined
      ? options.title
      : scene.route.name;

  return (
    <Appbar.Header theme={{ colors: { primary: colors.white } }}>
      <TouchableOpacity
        onPress={() => {
          navigation.openDrawer();
        }}
      >
        <Ionicons name="ios-menu" size={40} style={{ marginLeft: 15 }} />
      </TouchableOpacity>
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
