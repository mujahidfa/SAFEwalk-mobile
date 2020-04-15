import React from "react";
import { Appbar } from "react-native-paper";
import { Platform } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
    <Appbar.Header theme={{ colors: { primary: colors.lightorange } }}>
      <Appbar.Action
        icon="menu"
        color={colors.white}
        onPress={() => navigation.openDrawer()}
      />
      <Appbar.Content
        title={title}
        titleStyle={{
          alignSelf: "center",
          color: colors.white,
          // fix padding issue on Android
          ...Platform.select({
            ios: {},
            android: {
              paddingRight: wp("10%"),
            },
            default: {
              // other platforms, web for example
              paddingRight: wp("10%"),
            },
          }),
        }}
      />
    </Appbar.Header>
  );
}
