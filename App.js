import React from "react";
import Main from "./Main";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./contexts/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
