//Supabase
import { supabase } from "../client";

// Juegos
const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  const fetchGameQuestions = async (gameId) => {
    const { data, error } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_id", gameId)
      .order("question_order", { ascending: true });
  
    if (error) {
      console.error("Error al obtener preguntas del juego:", error);
      return [];
    }
  
    return data;
  };
  
  const saveGameScore = async (userId, gameId, score) => {
    const { data, error } = await supabase
      .from("game_scores")
      .insert({ user_id: userId, game_id: gameId, score: score })
      .select();
  
    if (error) {
      console.error("Error al guardar puntaje:", error);
      throw error;
    }
  
    return data[0];
  };
  
  const fetchUserGameScores = async (userId, gameId) => {
    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error al obtener puntajes del usuario:", error);
      return [];
    }
  
    return data;
  };

export { fetchGames, fetchGameQuestions, saveGameScore, fetchUserGameScores };