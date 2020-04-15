import React from "react";
import { StyleSheet, Text } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "../constants/colors";
import style from "../constants/style";

export default function ErrorText({ children }) {
  return <Text style={styles.textError}>{children}</Text>;
}

const styles = StyleSheet.create({
  textError: {
    color: colors.red,
    fontSize: hp("1.5%"),
  },
});
