import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID, 
    
    authority: import.meta.env.VITE_AUTHORITY, 
    
    redirectUri: import.meta.env.VITE_REDIRECT_URI, 
    
    postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI
  },
  cache: {
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: false, 
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read"]
};