import React from "react";
import { StyleSheet } from "react-native";

import { TextInput } from "react-native-paper";
import colors from "./../constants/colors";
import style from "./../constants/style";

export default function WrapperTextInput(props) {
  return (
    <TextInput
      label={props.label}
      placeholder={props.placeholder}
      defaultValue={props.defaultValue}
      onChangeText={props.onChangeText}
      ref={props.ref}
      mode="outlined"
      theme={{ colors: { primary: colors.orange } }}
      style={[styles.input, props.style]}
      keyboardType={props.keyboardType}
      autoCapitalize={props.autoCapitalize}
      secureTextEntry={props.secureTextEntry}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: style.inputHeight,
  },
});
