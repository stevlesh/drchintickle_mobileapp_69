import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";

export function getRedirectUri() {
  const useProxy = Constants.appOwnership === "expo"; // Expo Go
  return AuthSession.makeRedirectUri({
    useProxy,
    native: "drchintickle://auth-callback",
  });
}