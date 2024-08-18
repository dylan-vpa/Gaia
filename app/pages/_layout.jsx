//Expo & React Native
import { Tabs, Slot } from "expo-router"

const Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ headerShown: false }} />
    </Tabs>
  )
}

export default Layout