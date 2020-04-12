import React from "react";
import { View, Text, Button } from "react-native";
import Main from "./Main";
import { AuthProvider } from "./contexts/AuthProvider";
import ErrorBoundary from "react-native-error-boundary";

const CustomFallback = (props) => (
  <View>
    <Text>Something happened!</Text>
    <Text>{props.error.toString()}</Text>
    <Button onPress={props.resetError} title={"Try again"} />
  </View>
);

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={CustomFallback}>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </ErrorBoundary>
  );
}
