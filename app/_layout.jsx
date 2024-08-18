//Expo & React Native
import { Stack } from "expo-router"

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="pages" options={{ headerShown: false }} />
    </Stack>
  )
}

export default Layout