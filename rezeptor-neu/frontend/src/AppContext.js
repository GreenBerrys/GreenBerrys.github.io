import React from "react";

const AppContext = React.createContext({
  auth: null,
  setAuth: () => {}
});

export default AppContext;