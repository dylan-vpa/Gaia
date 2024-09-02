//Expo & React Native
import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

//Supabase
import { fetchGames } from "../../utils/supabase/actions";

//Components
import Header from "../../components/ui/Header";

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const gamesData = await fetchGames();
      setGames(gamesData || []);
    } catch (error) {
      console.error("Error al cargar los juegos:", error);
      setError(
        "No se pudieron cargar los juegos. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleGamePress = (game) => {
    router.push({
      pathname: "./game",
      params: { gameId: game.id, gameName: game.name },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Juegos" />
      <View className="flex-1 px-4 pt-6">
        <Text className="text-3xl font-bold mb-6 text-black text-center">
          Juegos
        </Text>
        <FlatList
          data={games}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              className={`bg-white p-4 mb-4 rounded-3xl shadow-lg ${index === 0 ? 'border-4 border-yellow-400' : ''}`}
              onPress={() => handleGamePress(item)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-16 h-16 ${index === 0 ? 'bg-yellow-400' : 'bg-[#58CC02]'} rounded-full mr-4 flex items-center justify-center`}>
                    <Text className="text-3xl font-bold text-white">{index + 1}</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-[#3C3C3C]">Unit {index + 1}</Text>
                    <Text className="text-sm text-[#777]">{item.name}</Text>
                  </View>
                </View>
                <View className="bg-[#E5E5E5] p-2 rounded-full">
                  <Text className="text-[#58CC02] font-bold">▶</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#58CC02"]}
            />
          }
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-2xl shadow-lg">
              <Text className="text-center text-lg text-[#3C3C3C]">
                {loading ? "Cargando juegos..." : "No hay juegos disponibles."}
              </Text>
            </View>
          }
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Games;
