import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Button,
  StyleSheet,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchOrSetUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          const randomUsername = `User${Math.floor(Math.random() * 10000)}`;
          await AsyncStorage.setItem("username", randomUsername);
          setUsername(randomUsername);
        }
      } catch (error) {
        console.error("Error retrieving or saving username:", error);
      }
    };

    const fetchChatId = async () => {
      try {
        const storedChatId = await AsyncStorage.getItem("chatId");
        if (storedChatId) {
          setChatId(storedChatId);
          setModalVisible(false);
        }
      } catch (error) {
        console.error("Error retrieving chatId:", error);
      }
    };

    fetchOrSetUsername();
    fetchChatId();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender: username,
        text: messageText,
        timestamp: serverTimestamp(),
      });
      setMessageText("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleJoinOrCreateRoom = async (newChatId: string) => {
    if (newChatId.trim()) {
      setChatId(newChatId);
      setModalVisible(false);

      try {
        await AsyncStorage.setItem("chatId", newChatId);
        console.log(`User ${username} joined/created room: ${newChatId}`);
      } catch (error) {
        console.error("Error saving chatId to AsyncStorage:", error);
      }
    } else {
      alert("Please enter a valid Chat ID or create a new one.");
    }
  };

  const shareChatLink = async () => {
    try {
      await Share.share({
        message: `Join my chat room on ChatApp using this ID: ${chatId} - http://localhost:3000/chat/${chatId}`,
      });
    } catch (error) {
      console.error("Error sharing chat link:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#4e54c86c" }}>
    <View
      style={{
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: "#4e54c8",
        borderBottomColor: "#4e54c86c",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{ fontSize: 20, color: "#fff", fontWeight: "bold" }}
        accessible={true}
        accessibilityLabel={`Chat ID: ${chatId}`}
      >
        {chatId}
      </Text>
      <View
        className="items-center"
        style={{ flexDirection: "row", gap: 10 }}
      >
        <View
          style={{
            backgroundColor: "#0077CC",
            borderRadius: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="rounded-lg w-full p-2"
            accessible={true}
            accessibilityLabel="Change Room"
            accessibilityHint="Opens a modal to change the chat room"
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 10 }}
              className="text-center text-[#4e54c8] font-semibold"
            >
              Change Room
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={shareChatLink}
          accessible={true}
          accessibilityLabel="Share chat link"
          accessibilityHint="Shares the current chat link with others"
        >
          <FontAwesome name="share-square-o" color="#fff" size={25} />
        </TouchableOpacity>
      </View>
    </View>
  
    {/* Modal */}
    {modalVisible && (
    <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => setModalVisible(false)}
    accessible={true}
    accessibilityLabel="Chat Room Modal"
    accessibilityHint="Contains options to join or create a chat room"
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Join or Create Chat Room</Text>
        <TextInput
          style={styles.modalInput}
          className="w-full text-center"
          placeholder="Enter Chat ID"
          placeholderTextColor="#888"
          value={chatId}
          onChangeText={setChatId}
          accessible={true}
          accessibilityLabel="Chat ID Input"
          accessibilityHint="Type a chat ID to join a room"
        />
        <View style={{ width: "100%", borderRadius: 50, backgroundColor: "#0077CC" }}>
          <TouchableOpacity
            onPress={() => handleJoinOrCreateRoom(chatId)}
            className="rounded-lg w-full"
            style={{
              paddingVertical: 10, // Ensures minimum height
              minHeight: 48, // Touch target height
              justifyContent: "center", // Centers content vertically
            }}
            accessible={true}
            accessibilityLabel="Join Chat Room Button"
            accessibilityHint="Joins the chat room with the entered ID"
          >
            <Text
              style={{ color: "#FFFFFF" }}
              className="text-center text-[#4e54c8] font-semibold"
            >
              Join Chat Room
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ marginVertical: 10, fontWeight: "bold" }}>OR</Text>
        <View style={{ width: "100%", borderRadius: 50, backgroundColor: "#0077CC" }}>
          <TouchableOpacity
            onPress={() => {
              const newChatId = `Room${Math.floor(Math.random() * 100000)}`;
              handleJoinOrCreateRoom(newChatId);
            }}
            className="rounded-lg w-full"
            style={{
              paddingVertical: 10, // Ensures minimum height
              minHeight: 48, // Touch target height
              justifyContent: "center", // Centers content vertically
            }}
            accessible={true}
            accessibilityLabel="Create Chat Room Button"
            accessibilityHint="Creates a new chat room with a randomly generated ID"
          >
            <Text
              style={{ color: "#FFFFFF" }}
              className="text-center text-[#4e54c8] font-semibold"
            >
              Create Chat Room
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  
    )}
  
    {/* Add similar accessibility attributes for other interactive elements as needed */}
  </SafeAreaView>
  
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#4e54c8",
  },
  modalInput: {
    backgroundColor: "transparent", // No background
    borderWidth: 1, // Equivalent to `border: 1px solid`
    borderColor: "#0077CC",
    borderRadius: 50,
    paddingVertical: 8, // Extracted from padding shorthand
    paddingHorizontal: 23,
    fontSize: 16,
    color: "#4e54c8",
    shadowColor: "#4e54c8", // Shadow color
    shadowOpacity: 0.09, // Opacity of shadow
    shadowOffset: {
      width: 0,
      height: 2, // Based on the direction of the shadow
    },
    shadowRadius: 16, // Smooth shadow edges
    elevation: 4, // Android shad
    marginBottom: 15,
  },
});

export default ChatRoom;
