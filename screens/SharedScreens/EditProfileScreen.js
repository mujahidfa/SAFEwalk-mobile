import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  AsyncStorage
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { Avatar, Divider } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { useForm } from "react-hook-form";
import { AuthContext } from "./../../contexts/AuthProvider";

import url from "./../../constants/api";
import colors from "../../constants/colors";

export default function EditProfileScreen() {
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [interests, setInterests] = useState("");
  const [edit, setEdit] = useState(false);

  const { userToken, email, userType } = useContext(AuthContext);

  // forms input handling
  const { register, setValue, handleSubmit, errors } = useForm();

  // update input upon change
  useEffect(() => {
    register("phoneNumber");
  }, [register]);

  // when component is mounted
  useEffect(() => {
    const response = getProfileInfo();
  }, []);

  const getProfileInfo = async () => {
    let user = true;
    let endpoint = "/api/Users/";
    if (userType == "safewalker") {
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
        isUser: user
      }
    }).then(response => {
      if (!(response.status === 200)) {
        console.log("captured " + response.status + "! Try again.");
      } else {
        return response.json();
      }
    });

    // set states to proper values based on backend response
    setFirstName(response.firstName);
    setLastName(response.lastName);
    setPhoneNumber(response.phoneNumber);
    setValue("phoneNumber", response.phoneNumber);
    setImage(response.photo);
    setInterests(response.interest);
  };

  // upon clicking the edit button on the avatar
  const uploadImage = async () => {
    // ask for permission to access camera roll
    await Permissions.askAsync(Permissions.CAMERA_ROLL).catch(function(error) {
      alert(error.message);
    });

    // select the image and size appropriately
    let result = await ImagePicker.launchImageLibraryAsync({
      allowEditing: true,
      aspect: [4, 3]
    });

    // if process has not been canceled, set state image and send to database
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  // for formatting phone number
  const formatPhone = () => {
    return (
      "(" +
      phoneNumber.substring(0, 3) +
      ") " +
      phoneNumber.substring(3, 6) +
      "-" +
      phoneNumber.substring(6, 10)
    );
  };

  // upon clicking save profile information button
  /*
   Response codes:
   401 (unauthorized)
   200 (ok)
   */
  const saveProfileInfo = async data => {
    await setPhoneNumber(data.phoneNumber);

    let endpoint = "/api/Users/";
    if (userType == "safewalker") {
      endpoint = "/api/Safewalkers/";
    }
    console.log("Phone number in saveProfileInfo:" + phoneNumber);
    // send new info to the database
    const response = await fetch(url + endpoint + email, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        token: userToken
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: data.phoneNumber,
        interest: interests,
        photo: image
      })
    })
      .then(response => {
        if (!(response.status === 200)) {
          console.log("captured " + response.status + "! Try again.");
        } else {
          console.log("success!");
          setEdit(false);
        }
      })
      .catch(error => {
        console.log(error.message);
        console.log("Error in saving profile information. Please try again.");
      });
  };

  // function that is called after save profile information button is pushed
  const onSubmit = data => {
    const response = saveProfileInfo(data);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        {!edit ? (
          <View style={styles.containerBottom}>
            <View style={{ alignItems: "center", marginBottom: 80 }}>
              {!image ? (
                <Avatar
                  rounded
                  size={200}
                  title={firstName + " " + lastName}
                  containerStyle={{ marginTop: 20 }}
                  overlayContainerStyle={{ backgroundColor: colors.orange }}
                  titleStyle={{ fontSize: 20 }}
                />
              ) : (
                <Avatar
                  rounded
                  source={{ uri: image }}
                  size={200}
                  title={firstName + " " + lastName}
                  overlayContainerStyle={{ backgroundColor: colors.orange }}
                  titleStyle={{ fontSize: 20 }}
                />
              )}
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.text}>First Name: {firstName}</Text>
            <Text style={styles.text}>Last Name: {lastName}</Text>
            <Divider style={styles.divider} />
            <Text style={styles.text}>Phone Number: {formatPhone()}</Text>
            <Divider style={styles.divider} />
            <Text style={styles.text}>Interests: {interests}</Text>
            <Divider style={styles.divider} />
            <TouchableOpacity onPress={() => setEdit(true)}>
              <Text style={styles.buttonEdit}> Edit Profile Information </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.containerBottom}>
            <View style={{ alignItems: "center" }}>
              {!image ? (
                <Avatar
                  rounded
                  size={200}
                  title={firstName + " " + lastName}
                  containerStyle={{ marginBottom: 30 }}
                  overlayContainerStyle={{ backgroundColor: colors.orange }}
                  titleStyle={{ fontSize: 20 }}
                  showEditButton
                  onEditPress={() => uploadImage()}
                />
              ) : (
                <Avatar
                  rounded
                  source={{ uri: image }}
                  size={200}
                  title={firstName + " " + lastName}
                  overlayContainerStyle={{ backgroundColor: colors.orange }}
                  titleStyle={{ fontSize: 20 }}
                  showEditButton
                  onEditPress={() => uploadImage()}
                />
              )}
            </View>
            <TextInput
              label="First Name"
              defaultValue={firstName}
              placeholder={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              theme={{ colors: { primary: colors.orange } }}
              style={styles.inputContainer}
            />
            <TextInput
              label="Last Name"
              defaultValue={lastName}
              placeholder={lastName}
              onChangeText={setLastName}
              mode="outlined"
              theme={{ colors: { primary: colors.orange } }}
              style={styles.inputContainer}
            />

            {errors.phoneNumber && (
              <Text style={styles.textError}>
                Valid US phone number is required.
              </Text>
            )}
            <TextInput
              label="Phone Number"
              defaultValue={phoneNumber}
              placeholder={phoneNumber}
              ref={register(
                { name: "phoneNumber" },
                {
                  required: false,
                  minLength: 10,
                  maxLength: 10,
                  pattern: /^[0-9]+$/
                }
              )}
              onChangeText={text => {
                setValue("phoneNumber", text, true);
              }}
              mode="outlined"
              theme={{ colors: { primary: colors.orange } }}
              style={styles.inputContainer}
              keyboardType={"numeric"}
            />
            <TextInput
              label="Interests"
              defaultValue={interests}
              placeholder={interests}
              onChangeText={setInterests}
              mode="outlined"
              theme={{ colors: { primary: colors.orange } }}
              style={styles.inputContainer}
            />
            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonEdit}> Save Profile Information </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    flex: 0.3,
    backgroundColor: colors.white,
    alignItems: "center"
  },
  containerBottom: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 15,
    paddingBottom: 20,
    justifyContent: "flex-end"
  },
  buttonEdit: {
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 25,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    marginTop: 40
  },
  inputContainer: {
    borderBottomWidth: 0,
    margin: 10,
    backgroundColor: colors.white
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    marginLeft: 20
  },
  divider: {
    backgroundColor: "black",
    marginBottom: 26
  },
  textError: {
    color: colors.red,
    marginLeft: 10
  }
});
