//Expo & React Native
import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

//Supabase
import { fetchGameQuestions } from "../../utils/supabase/actions";

//Components
import Header from "../../components/ui/Header";

const GameQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const { gameId, gameName } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const questionsData = await fetchGameQuestions(gameId);
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error al cargar las preguntas:", error);
      setError(
        "No se pudieron cargar las preguntas. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setGameFinished(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameFinished(false);
    loadQuestions();
  };

  const parseAnswers = (answers) => {
    if (Array.isArray(answers)) {
      return answers;
    } else if (typeof answers === "string") {
      try {
        const parsed = JSON.parse(answers);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return answers.split(",").map((item) => item.trim());
      }
    } else {
      console.error("Invalid answers format:", answers);
      return [];
    }
  };

  const renderQuestion = () => {
    if (questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    let answers = parseAnswers(currentQuestion.answers);

    if (answers.length === 0) {
      setError("No se pudieron procesar las respuestas.");
      return null;
    }

    return (
      <View className="flex-1">
        <Text className="text-3xl font-bold mb-8 text-[#3C3C3C]">
          {currentQuestion.question}
        </Text>
        {answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            className={`p-4 mb-4 rounded-2xl border-2 ${
              selectedAnswer === answer
                ? "bg-[#E5F8D4] border-[#58CC02]"
                : "bg-white border-[#E5E5E5]"
            }`}
            onPress={() => handleAnswerSelect(answer)}
          >
            <Text className={`text-lg text-center ${
              selectedAnswer === answer ? "text-[#58CC02] font-semibold" : "text-[#3C3C3C]"
            }`}>
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderGameFinished = () => (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold text-center mb-6 text-[#58CC02]">
        ¡Excelente!
      </Text>
      <Text className="text-2xl text-center mb-8 text-[#3C3C3C]">
        Tu puntaje: {score} de {questions.length}
      </Text>
      <TouchableOpacity
        className="bg-[#58CC02] p-4 rounded-2xl w-full mb-4"
        onPress={restartGame}
      >
        <Text className="text-white text-center text-lg font-bold">REPETIR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#E5E5E5] p-4 rounded-2xl w-full"
        onPress={() => router.push("./games")}
      >
        <Text className="text-[#58CC02] text-center text-lg font-bold">VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-[#E5E5E5]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#3C3C3C" />
        </TouchableOpacity>
      </View>
      {!gameFinished && (
        <View className="bg-[#FEE932] p-2 mt-5">
          <View 
            className="bg-[#FFC800] h-2 rounded-full" 
            style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }} 
          />
        </View>
      )}
      <ScrollView className="flex-1 px-4 pt-6">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-center text-lg text-[#3C3C3C]">
              Cargando preguntas...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-center text-lg text-red-600">{error}</Text>
          </View>
        ) : gameFinished ? (
          renderGameFinished()
        ) : (
          renderQuestion()
        )}
      </ScrollView>
      {selectedAnswer && !gameFinished && (
        <View className="p-4 bg-white border-t border-[#E5E5E5]">
          <TouchableOpacity
            className="bg-[#58CC02] p-4 rounded-2xl"
            onPress={handleNextQuestion}
          >
            <Text className="text-white text-center text-lg font-bold">
              {currentQuestionIndex === questions.length - 1 ? "VERIFICAR" : "CONTINUAR"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default GameQuestions;
