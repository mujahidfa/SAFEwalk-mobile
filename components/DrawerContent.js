import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { DrawerItem, DrawerContentScrollView } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar, Title, Caption } from "react-native-paper";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Spacer from "./../components/Spacer";

// Constants
import colors from "./../constants/colors";
import url from "./../constants/api";

import { AuthContext } from "./../contexts/AuthProvider";

export default function DrawerContent(props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");
  const { signout } = useContext(AuthContext);
  const { userToken, email, userType } = useContext(AuthContext);

  useEffect(() => {
    const getProfileInfo = async () => {
      let user = true;
      let endpoint = "/api/Users/";
      if (userType === "safewalker") {
        endpoint = "/api/Safewalkers/";
        user = false;
      }

      // get info from the database
      const response = await fetch(url + endpoint + email, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          email: email,
          token: userToken,
          isUser: user,
        },
      }).then((response) => {
        if (!(response.status === 200)) {
          console.log("captured " + response.status + "! Try again.");
        } else {
          return response.json();
        }
      });

      // set states to proper values based on backend response
      setFirstName(response.firstName);
      setLastName(response.lastName);
      setImage(response.photo);
    };

    getProfileInfo();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View style={styles.userInfoSection}>
        <Avatar.Image
          source={{
            uri: !image
              ? "https://ui-avatars.com/api/?name=" + firstName + "+" + lastName
              : image,
          }}
          size={wp("25%")}
        />
        <Spacer padding={{ paddingVertical: hp("1%") }} />
        {/* Name */}
        <Title style={styles.title}>
          {firstName} {lastName}
        </Title>

        {/* Email */}
        <Caption style={styles.caption}>{email}</Caption>
      </View>

      {/* Navigation */}
      <View style={styles.navSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          )}
          {...props}
          label="Home"
          onPress={() => props.navigation.navigate("Home")}
        />
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={size}
            />
          )}
          {...props}
          label="Edit Profile"
          onPress={() => props.navigation.navigate("EditProfile")}
        />
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialCommunityIcons
              name="settings-outline"
              color={color}
              size={size}
            />
          )}
          {...props}
          label="Login Settings"
          onPress={() => props.navigation.navigate("LoginSettings")}
        />
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="logout" color={color} size={size} />
          )}
          {...props}
          label="Log out"
          onPress={() => signout()}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userInfoSection: {
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  title: {
    fontWeight: "600",
    color: colors.white,
    fontSize: wp("5%"),
  },
  caption: {
    fontSize: wp("3%"),
    lineHeight: wp("3%"),
    color: colors.white,
  },
  navSection: {
    backgroundColor: "white",
    height: hp("80%"),
    paddingLeft: wp("1%"),
    paddingTop: wp("1%"),
  },
});
