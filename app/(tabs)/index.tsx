import UsernameModal from "@/components/UsernameModal";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { updateDoc, doc, setDoc } from "firebase/firestore"; // Firestore imports
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Button,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons
import { db } from "../../firebaseConfig"; // Your Firebase configuration

const AnonymousQuestionScreen = () => {
  const [randomQuestions, setRandomQuestions] = useState([
    { id: "q1", text: "What's on your mind?" },
    { id: "q2", text: "Ask me anything!" },
    { id: "q3", text: "What would you like to know?" },
    { id: "q4", text: "What's your favorite memory?" },
    { id: "q5", text: "What makes you happy?" },
    { id: "q6", text: "What's a random thought you had today?" },
    { id: "q7", text: "If you could have one wish, what would it be?" },
    { id: "q8", text: "What's the best advice you've ever received?" },
    { id: "q9", text: "What motivates you every day?" },
    { id: "q10", text: "If you could travel anywhere, where would you go?" },
    { id: "q11", text: "What's something new you'd like to try?" },
    { id: "q12", text: "What’s a fun fact about yourself?" },
    { id: "q13", text: "What’s a challenge you’ve recently overcome?" },
    { id: "q14", text: "What’s your go-to comfort food?" },
    { id: "q15", text: "What’s a hobby you’d like to pick up?" },
    {
      id: "q16",
      text: "If you could live in any time period, which one would it be?",
    },
    { id: "q17", text: "What’s your favorite way to spend a weekend?" },
    { id: "q18", text: "What’s your dream job?" },
    { id: "q19", text: "What’s a book, movie, or series that inspired you?" },
    { id: "q20", text: "What’s something you’re grateful for today?" },
    { id: "q21", text: "What’s a skill you wish you had?" },
    { id: "q22", text: "Who’s someone you admire and why?" },
    { id: "q23", text: "What’s your biggest fear?" },
    { id: "q24", text: "What’s a life lesson you’ve learned recently?" },
    { id: "q25", text: "What’s a song that always lifts your mood?" },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState({
    id: "default",
    text: "Ask me anything, anonymously",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [inputQuestion, setInputQuestion] = useState(currentQuestion.text);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username);
          setUserId(user.id);
        } else {
          setIsModalVisible(true);
          console.error("User not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };

    initializeUser();
  }, [username]);

  const handleUsernameSubmit = (userData: any) => {
    if (typeof userData === "string") {
      setUsername(userData); // When directly passing a string
    } else if (userData?.username) {
      setUsername(userData.username); // Extract `username` if `userData` is an object
    }
  };

  const generateRandomQuestion = async () => {
    const randomIndex = Math.floor(Math.random() * randomQuestions.length);
    const randomQuestion = randomQuestions[randomIndex];

    setCurrentQuestion(randomQuestion);
    setInputQuestion(randomQuestion.text);
    setIsEditing(false);

    try {
      if (!userId) {
        console.error("User ID is missing!");
        return;
      }

      const userDoc = doc(db, "users", userId); // Use userId as the document ID
      await setDoc(userDoc, { text: randomQuestion.text }, { merge: true }); // Create or update
    } catch (error) {
      console.error("Error updating question in Firebase:", error);
    }
  };

  //   const clearAsyncStorage = async () => {
  //   try {
  //     await AsyncStorage.clear();
  //     console.log('AsyncStorage successfully cleared!');
  //   } catch (error) {
  //     console.error('Failed to clear AsyncStorage:', error);
  //   }
  // };

  // clearAsyncStorage();

  const handleSave = async () => {
    if (inputQuestion.trim() !== "") {
      const updatedQuestion = {
        ...currentQuestion,
        text: inputQuestion,
      };

      setCurrentQuestion(updatedQuestion);

      if (currentQuestion.id === "default") {
        const newQuestion = {
          id: `q${randomQuestions.length + 1}`,
          text: inputQuestion,
        };
        setRandomQuestions([...randomQuestions, newQuestion]);
        setCurrentQuestion(newQuestion);
      } else {
        const updatedQuestions = randomQuestions.map((question) =>
          question.id === currentQuestion.id ? updatedQuestion : question
        );
        setRandomQuestions(updatedQuestions);
      }

      setIsEditing(false);

      try {
        if (!userId) {
          console.error("User ID is missing!");
          return;
        }

        const userDoc = doc(db, "users", userId); // Reference to the user's document
        await setDoc(userDoc, { text: inputQuestion }, { merge: true }); // Update only specific fields
        console.log("Question updated in Firebase:", inputQuestion);
      } catch (error) {
        console.error("Error updating question in Firebase:", error);
      }
    }
  };

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      // Focus and highlight the text
      textInputRef.current.focus();
      textInputRef.current.setSelection(0, inputQuestion.length);
    }
  }, [isEditing]);

  const chatLink = `https://mistchat.netlify.app/messages?username=${username}/?id=${userId}`;

  const shareChatLink = async () => {
    try {
      await Share.share({
        message: `${inputQuestion} - ${chatLink} `,
      });
    } catch (error) {
      console.error("Error sharing chat link:", error);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ flex: 1, backgroundColor: "#e6e6fa" }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#e6e6fa",
        }}
      >
        <View style={{ flex: 1, padding: 10 }}>
          {/* Question Generator Container */}
          <View style={{ marginTop: 60 }}>
            <Text
              style={{
                fontSize: 24,
              }}
              className="text-[#4e54c8] pl-2 mb-4 font-semibold text-left"
            >
              Hi, {username}👋
            </Text>
          </View>
          <View
            style={{
              width: 370,
              borderRadius: 15,
              height: 180,
              marginBottom: 24,
              backgroundColor: "#4e54c8",
            }}
          >
            <View
              style={{
                padding: 24,
                borderRadius: 15,
                height: 180,
                marginBottom: 24,
              }}
              className="w-full"
            >
              <ImageBackground
                source={require("../../assets/images/questions.png")}
                resizeMode="contain"
                style={{ height: 150, width: "100%", justifyContent: "center" }}
              >
                {isEditing ? (
                  <TextInput
                    ref={textInputRef}
                    className="bg-transparent text-white p-2 rounded-lg text-center"
                    value={inputQuestion}
                    style={{ fontSize: 20 }}
                    onChangeText={setInputQuestion}
                  />
                ) : (
                  <Text
                    style={{ color: "#FFFFFF", fontSize: 24 }}
                    className="font-semibold text-center mb-2"
                  >
                    {currentQuestion.text}
                  </Text>
                )}

                <View className="flex-row justify-center mt-2">
                  <TouchableOpacity
                    onPress={generateRandomQuestion}
                    className="flex-row items-center mx-2 rounded-lg px-4"
                    style={{
                      minHeight: 48,
                      paddingVertical: 6,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="shuffle"
                      size={16}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: "#FFFFFF" }} className="text-sm">
                      Random
                    </Text>
                  </TouchableOpacity>
                  {isEditing ? (
                    <TouchableOpacity
                      onPress={handleSave}
                      className="flex-row items-center mx-2 rounded-lg px-4"
                      style={{
                        minHeight: 48,
                        paddingVertical: 6,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="save"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#FFFFFF" }} className="text-sm">
                        Save
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      className="flex-row items-center mx-2 rounded-lg px-4"
                      style={{
                        minHeight: 48,
                        paddingVertical: 6,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="create"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#FFFFFF" }} className="text-sm">
                        Edit Question
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ImageBackground>
            </View>
          </View>

          {/* Copy Link Section */}
          <View className="bg-white p-4 rounded-2xl mb-6">
            <Text className="text-[#4e54c8] text-lg font-semibold text-center mb-2">
              Step 1: Copy the chat link below
            </Text>
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <Text className="text-gray-500 text-center">{chatLink}</Text>
            </View>

            <TouchableOpacity
              onPress={() => shareChatLink()}
              className="bg-[#4e54c8] rounded-lg w-full"
              style={{
                minHeight: 56, // Set a larger minimum height to meet the touch target guideline
                justifyContent: "center",
                alignItems: "center", // Center the text horizontally
                paddingVertical: 12, // Adjust padding for better spacing
              }}
            >
              <Text
                style={{ color: "#FFFFFF" }}
                className="text-center text-lg font-semibold" // Use a slightly larger font size for better readability
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <UsernameModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSubmit={handleUsernameSubmit}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AnonymousQuestionScreen;
