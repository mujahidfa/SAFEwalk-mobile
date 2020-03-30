import React from "react";
import Main from "./Main";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./contexts/AuthProvider";

console.disableYellowBox = true;

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
