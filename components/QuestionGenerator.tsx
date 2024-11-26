import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';

const QuestionGenerator = () => {
  const [currentQuestion, setCurrentQuestion] = useState("What's your favorite book?");
  const [isEditing, setIsEditing] = useState(false);
  const [inputQuestion, setInputQuestion] = useState(currentQuestion);


  const generateRandomQuestion = () => {
    const randomQuestions = [
      "What's your favorite hobby?",
      "If you won the lottery, what would you do?",
      "What's your most cherished memory?",
      "What's your dream job?"
    ];
    const randomIndex = Math.floor(Math.random() * randomQuestions.length);
    setCurrentQuestion(randomQuestions[randomIndex]);
    setInputQuestion(randomQuestions[randomIndex]);
    setIsEditing(false);
  };

  const handleSave = () => {
    setCurrentQuestion(inputQuestion);
    setIsEditing(false);
  };

  return (
    <View className='p-6 bg-gray-100 h-full'>
      {/* Main Question Box */}
      <View className='bg-white p-4 rounded-lg mb-4'>
        {isEditing ? (
          <TextInput
            className='border border-gray-300 p-2 rounded-lg'
            value={inputQuestion}
            onChangeText={setInputQuestion}
          />
        ) : (
          <Text className='text-lg font-bold text-gray-800'>
            {currentQuestion}
          </Text>
        )}
        <View className='flex-row mt-2'>
          <Button title="Generate" onPress={generateRandomQuestion} />
          {isEditing ? (
            <Button title="Save" onPress={handleSave} />
          ) : (
            <Button title="Edit" onPress={() => setIsEditing(true)} />
          )}
        </View>
      </View>
    </View>
  );
};

export default QuestionGenerator;
