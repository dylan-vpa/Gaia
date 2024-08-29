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
    <SafeAreaView className="flex-1 bg-gradient-to-b from-green-400 to-emerald-600">
      <Header title="Juegos" />
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold mb-6 text-white text-center">
          ¡Elige tu juego!
        </Text>
        <FlatList
          data={games}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-5 mb-4 rounded-2xl shadow-lg"
              onPress={() => handleGamePress(item)}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-lime-300 rounded-full mr-4 flex items-center justify-center">
                  <Text className="text-2xl font-bold text-green-800">{item.name[0]}</Text>
                </View>
                <Text className="text-xl font-semibold text-green-800">{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#10B981"]} // Color verde esmeralda para el indicador de recarga
            />
          }
          ListEmptyComponent={
            <View className="bg-white p-6 rounded-2xl shadow-lg">
              <Text className="text-center text-lg text-green-800">
                {loading ? "Cargando juegos..." : "No hay juegos disponibles."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Games;
