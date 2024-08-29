//Expo & React Native
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

//Constants
import { colors } from "../../constants";

const Layout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "games") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "projects") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen
        name="game"
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
};

export default Layout;
