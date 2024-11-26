import { Tabs } from "expo-router";
import React from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons"; // Import icons

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 80, // Increased tab bar height
          backgroundColor: "#4e54c8", // Updated background color
          paddingBottom: 20, // Optional: add some padding for better alignment
        },
        tabBarLabelStyle: {
          fontSize: 14, // Optional: Adjust font size for labels
        },
        tabBarIconStyle: {
          marginBottom: -15, // Optional: Add margin for icons if needed
        },
        tabBarActiveTintColor: "#FFFFFF", // Active tab color
        tabBarInactiveTintColor: "#AAAAAA", // Inactive tab color
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
          headerShown: false, // Hides the header for this tab
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" color={color} size={size} />
          ),
          headerShown: false, // Hides the header for this tab
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'Questions',
          tabBarLabel: "Questions",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="question-answer" color={color} size={size} />
          ),
          headerShown: !false, // Hides the header for this tab
          headerStyle: {
            backgroundColor: '#4F54C1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tabs>
  );
}
