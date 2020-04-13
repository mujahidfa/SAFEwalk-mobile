import React from "react";
import { View, StyleSheet, Text } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "../constants/colors";
import style from "../constants/style";

export default function Or(props) {
  return (
    <View style={styles.orContainer}>
      {props.withOr === false ? (
        <>
          <View style={styles.orLine} />
        </>
      ) : (
        <>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  orText: {
    fontSize: style.fontSize,
    color: colors.lightgray,
    paddingHorizontal: wp("5%"),
  },
  orLine: {
    borderWidth: 1,
    borderColor: colors.lightgray,
    flex: 1,
  },
});
