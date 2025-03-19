import React from "react";

const AppContext = React.createContext(
  {
    auth: false,
    setAuth: () => {},
    edit: false,
    setEdit: () => {}
  });
  
export default AppContext;
