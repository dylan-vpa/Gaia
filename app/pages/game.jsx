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
      <View className="bg-white p-4 mb-4 rounded-lg shadow">
        <Text className="text-lg font-bold mb-2">
          {currentQuestion.question}
        </Text>
        {answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            className={`p-2 mb-2 rounded ${
              selectedAnswer === answer ? "bg-blue-300" : "bg-blue-100"
            }`}
            onPress={() => handleAnswerSelect(answer)}
          >
            <Text>{answer}</Text>
          </TouchableOpacity>
        ))}
        {selectedAnswer && (
          <TouchableOpacity
            className="bg-green-500 p-2 rounded mt-4"
            onPress={handleNextQuestion}
          >
            <Text className="text-white text-center">
              {currentQuestionIndex === questions.length - 1
                ? "Finalizar"
                : "Siguiente pregunta"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderGameFinished = () => (
    <View className="bg-white p-4 mb-4 rounded-lg shadow">
      <Text className="text-2xl font-bold text-center mb-4">
        Juego terminado. Tu puntaje: {score} de {questions.length}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 p-2 rounded mb-2"
        onPress={restartGame}
      >
        <Text className="text-white text-center">Jugar de nuevo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-gray-500 p-2 rounded mb-2"
        onPress={() => router.push("./games")}
      >
        <Text className="text-white text-center">Volver a juegos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-500 p-2 rounded"
        onPress={() => router.push("./home")}
      >
        <Text className="text-white text-center">Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title={gameName} />
      <ScrollView className="flex-1 p-4 bg-gray-100">
        {!gameFinished && (
          <Text className="text-2xl font-bold mb-4">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </Text>
        )}
        {loading ? (
          <Text className="text-center text-gray-500">
            Cargando preguntas...
          </Text>
        ) : error ? (
          <Text className="text-center text-red-500">{error}</Text>
        ) : gameFinished ? (
          renderGameFinished()
        ) : (
          renderQuestion()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GameQuestions;
