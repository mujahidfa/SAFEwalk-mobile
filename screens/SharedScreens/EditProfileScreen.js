import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, SafeAreaView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { Avatar, Divider } from "react-native-elements";
import { TextInput } from "react-native-paper";
import colors from "../../constants/colors";

export default function EditProfileScreen() {
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("Yoon");
  const [lastName, setLastName] = useState("Cho");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [interests, setInterests] = useState("");
  const [edit, setEdit] = useState(false);

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
      // TODO: This is where the fetch would be to send new image to the database
    }
  };

  // upon clicking save profile information button
  const saveProfileInfo = async () => {
    // set state edit to false and send info to database
    setEdit(false);
    // TODO: This is where the fetch would be to send new info to the database
  };

  // TODO: ADD React Hook Form see slack
  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={"padding"}>
      <SafeAreaView style={{flex: 1}}>
      {!edit ? (
        <View style={styles.containerBottom}>
          <View style={{alignItems: 'center', marginBottom: 80}}>
            {image === "" ? (
                <Avatar
                    rounded
                    size={200}
                    title={firstName + " " + lastName}
                    containerStyle={{marginTop: 20}}
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
          <Text style={styles.text}>Phone Number: {phoneNumber}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.text}>Interests: {interests}</Text>
          <Divider style={styles.divider} />
          <TouchableOpacity onPress={() => setEdit(true)}>
            <Text style={styles.buttonEdit}> Edit Profile Information </Text>
          </TouchableOpacity>
        </View>
        ) : (
        <View style={styles.containerBottom}>
          <View style={{alignItems: 'center'}}>
            {image === "" ? (
                <Avatar
                    rounded
                    size={200}
                    title={firstName + " " + lastName}
                    containerStyle={{marginBottom: 30}}
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
              placeholder={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              theme={{ colors: { primary: colors.orange } }}
              style={styles.inputContainer}
          />
          <TextInput
            label="Last Name"
            placeholder={lastName}
            onChangeText={setLastName}
            mode="outlined"
            theme={{ colors: { primary: colors.orange } }}
            style={styles.inputContainer}
          />
          <TextInput
            label="Phone Number"
            placeholder={phoneNumber}
            onChangeText={setPhoneNumber}
            mode="outlined"
            theme={{ colors: { primary: colors.orange } }}
            style={styles.inputContainer}
          />
          <TextInput
            label="Interests"
            placeholder={interests}
            onChangeText={setInterests}
            mode="outlined"
            theme={{ colors: { primary: colors.orange } }}
            style={styles.inputContainer}
          />
          <TouchableOpacity onPress={() => setEdit(false)}>
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
    justifyContent: 'flex-end'
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
    marginTop: 40,
  },
  inputContainer: {
    borderBottomWidth: 0,
    margin: 10,
    backgroundColor: colors.white,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    marginLeft: 20
  },
  divider: {
    backgroundColor: "black",
    marginBottom: 26
  }
});
