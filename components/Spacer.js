import React from "react";
import { View, StyleSheet } from "react-native";

import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function Spacer(props) {
  return <View style={[styles.spacer, props.padding]} />;
}

const styles = StyleSheet.create({
  spacer: {
    paddingVertical: hp("1.7%"),
  },
});
