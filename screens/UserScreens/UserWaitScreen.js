import React, { useEffect, useContext } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    AsyncStorage, StyleSheet,
} from "react-native";
import LottieView from 'lottie-react-native';
import io from "socket.io-client";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";

// TODO: Get rid of the header and drawer access
export default function UserHomeScreen({ navigation }) {
    const { userToken, email } = useContext(AuthContext);

    async function setSocketId() {
        // PutUser API call
        const res = await fetch(
            "https://safewalkapplication.azurewebsites.net/api/Users/" + email,
            {
                method: "PUT",
                headers: {
                    token: userToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    socketId: socket.id
                })
            }
        );

        if (status != 200 && status != 201) {
            console.log("set socketId failed: status " + status);
            return;
        }
    }

    useEffect(() => {
        console.log("socket id " + socket.id);
        setSocketId();

        // socket to listen to walker status change
        socket.on("walker walk status", status => {
            console.log(status);

            switch (status) {
                case -2:
                    // navigation.navigate('UserHome');
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "UserHome"
                            }
                        ]
                    });
                    alert("The SAFEwalker has canceled the walk.");
                    break;
                case -1:
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "UserHome"
                            }
                        ]
                    });
                    alert("Your request was denied.");
                    break;
                case 1:
                    // navigation.navigate("UserTab");
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "UserTab"
                            }
                        ]
                    });
                    alert("A SAFEwalker is on their way!");
                    break;
                case 2:
                    // navigation.navigate("UserHome");
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "UserHome"
                            }
                        ]
                    });
                    alert("The walk has been completed!");
                    break;
            }
        });
    }, []);

    async function cancelRequest() {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: "UserHome"
                }
            ]
        });
        alert("Request Canceled");

        const id = await AsyncStorage.getItem("walkId");
        // DeleteWalk API call
        const res = await fetch(
            "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
            {
                method: "DELETE",
                headers: {
                    token: userToken,
                    email: email,
                    isUser: true
                }
            }
        );

        let status = res.status;
        if (status !== 200 && status !== 201) {
            console.log("delete walk failed: status " + status);
            return;
        }

        // remove walk-related info
        await AsyncStorage.removeItem("WalkId");

        socket.emit("walk status", true); // send notification to all Safewalkers
    }

    return (
        <View style={styles.container}>
            {/* View When the User Submits a SAFEwalk Request */}
            <View style={{flex: 3}}>
                <Text
                    style={{
                        textAlign: "center",
                        fontSize: 30,
                        color: colors.orange,
                        fontWeight: "bold",
                        marginTop: 20
                    }}
                >
                    Searching for {"\n"} SAFEwalker...
                </Text>
                <LottieView
                    source={require('./../../assets/17709-loading')}
                    speed={1}
                    autoPlay={true}
                    loop
                    autoSize={true}
                />
            </View>
            <View style={{flex: 1}}>
                <TouchableOpacity onPress={() => cancelRequest()}>
                    <Text style={styles.buttonCancel}> Cancel </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: "center",
    },
    buttonCancel: {
        backgroundColor: colors.red,
        borderColor: colors.white,
        borderWidth: 1,
        borderRadius: 25,
        color: colors.white,
        fontSize: 24,
        fontWeight: "bold",
        overflow: "hidden",
        padding: 12,
        textAlign: "center",
        width: 200,
    },
});