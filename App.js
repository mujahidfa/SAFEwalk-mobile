import React from "react";
import Main from "./Main";

import { AuthProvider } from "./contexts/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
