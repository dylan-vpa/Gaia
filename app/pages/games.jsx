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
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Juegos" />
      <View className="flex-1 p-4 bg-gray-100">
        <Text className="text-2xl font-bold mb-4">Juegos disponibles:</Text>
        <FlatList
          data={games}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-4 mb-2 rounded-lg shadow"
              onPress={() => handleGamePress(item)}
            >
              <Text className="text-lg">{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-500">
              {loading ? "Cargando juegos..." : "No hay juegos disponibles."}
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Games;
