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
      <View className="bg-white p-6 mb-4 rounded-2xl shadow-lg">
        <Text className="text-xl font-bold mb-6 text-slate-800">
          {currentQuestion.question}
        </Text>
        {answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            className={`p-4 mb-4 rounded-full ${
              selectedAnswer === answer
                ? "bg-slate-200"
                : "bg-slate-100"
            }`}
            onPress={() => handleAnswerSelect(answer)}
          >
            <Text className={`text-lg text-center ${
              selectedAnswer === answer ? "text-slate-800 font-semibold" : "text-slate-700"
            }`}>
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
        {selectedAnswer && (
          <TouchableOpacity
            className="bg-green-700 p-4 rounded-full mt-6 shadow-md"
            onPress={handleNextQuestion}
          >
            <Text className="text-white text-center text-lg font-bold">
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
    <View className="bg-white p-6 mb-4 rounded-2xl shadow-lg">
      <Text className="text-3xl font-bold text-center mb-6 text-green-800">
        ¡Juego terminado!
      </Text>
      <Text className="text-2xl text-center mb-8 text-green-600">
        Tu puntaje: {score} de {questions.length}
      </Text>
      <TouchableOpacity
        className="bg-green-700 p-4 rounded-full mb-4 shadow-md"
        onPress={restartGame}
      >
        <Text className="text-white text-center text-lg font-bold">Jugar de nuevo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-full mb-4 shadow-md"
        onPress={() => router.push("./games")}
      >
        <Text className="text-white text-center text-lg font-bold">Volver a juegos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-purple-600 p-4 rounded-full shadow-md"
        onPress={() => router.push("./home")}
      >
        <Text className="text-white text-center text-lg font-bold">Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-200 to-slate-300">
      <Header title={gameName} />
      <ScrollView className="flex-1 p-6">
        {!gameFinished && (
          <View className="bg-white p-4 mb-6 rounded-2xl shadow-lg">
            <Text className="text-2xl font-bold text-center text-slate-800">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </Text>
          </View>
        )}
        {loading ? (
          <View className="bg-white p-6 rounded-2xl shadow-lg">
            <Text className="text-center text-lg text-slate-800">
              Cargando preguntas...
            </Text>
          </View>
        ) : error ? (
          <View className="bg-white p-6 rounded-2xl shadow-lg">
            <Text className="text-center text-lg text-red-600">{error}</Text>
          </View>
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
