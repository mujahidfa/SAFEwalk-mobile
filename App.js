import React from "react";
import Main from "./Main";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./contexts/AuthProvider";
import { YellowBox } from "react-native";

YellowBox.ignoreWarnings([
  "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?",
]);

console.disableYellowBox = true;

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
