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
          backgroundColor:"#4e54c8",
          borderBottomColor: "#4e54c86c",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, color: "#fff", fontWeight: "bold" }}>
          {chatId}
        </Text>
        <View
          className="items-center"
          style={{ flexDirection: "row", gap: 10 }}
        >
          <View
            // colors={["#0077CC", "#4e54c8"]}
            style={{
              // width: "100%",
              // margin:10,
              backgroundColor:"#0077CC",
              borderRadius: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="rounded-lg w-full p-2"
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 10 }}
                className="text-center text-[#4e54c8] font-semibold"
              >
                Change Room
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={shareChatLink}>
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
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Join or Create Chat Room</Text>
              <TextInput
                style={styles.modalInput}
                className="w-full text-center"
                placeholder="Enter Chat ID"
                value={chatId}
                onChangeText={setChatId}
              />

              <View
                // colors={["#0077CC", "#4e54c8"]}
                style={{
                  width: "100%",
                  // margin:10,
                  borderRadius: 50,
                  backgroundColor:"#0077CC"
                }}
              >
                <TouchableOpacity
                  onPress={() => handleJoinOrCreateRoom(chatId)} // Static button color
                  className="rounded-lg w-full p-3"
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
              <View
                style={{
                  width: "100%",
                  // margin:10,
                  borderRadius: 50,
                  backgroundColor:"#0077CC"
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    const newChatId = `Room${Math.floor(
                      Math.random() * 100000
                    )}`;
                    handleJoinOrCreateRoom(newChatId);
                  }}
                  className="rounded-lg w-full p-3"
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

      {/* Chat List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 16 }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 10,
                marginVertical: 5,
                borderRadius: 8,
                backgroundColor:
                  item.sender === username ? "#0077CC" : "#4e54c8",
                alignSelf: item.sender === username ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              <Text
                style={{ fontWeight: "bold", marginBottom: 5, color: "#fff" }}
              >
                {item.sender}
              </Text>
              <Text style={{ color: "#fff" }}>{item.text}</Text>
              <Text style={{ fontSize: 10, color: "#fff", marginTop: 5 }}>
                {item.timestamp
                  ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString()
                  : "Sending..."}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />
      )}

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
      >
        <View
          // colors={["#0077CC", "#4e54c8"]}
          style={{
            flex: 1,
            // margin:10,
            borderRadius: 5,
            marginRight: 8,
            backgroundColor:"#0077CC"
          }}
        >
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 15,
              backgroundColor: "transparent",
              fontSize: 16,
              color: "white",
            }}
            placeholder="Type a message..."
            placeholderTextColor="#fff"
            value={messageText}
            onChangeText={setMessageText}
          />
        </View>
        <View
          // colors={["#0077CC", "#4e54c8"]}
          style={{
            // margin:10,
            borderRadius: 5,
            backgroundColor:"#0077CC"

          }}
        >
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 15,
            }}
          >
            <MaterialIcons name="send" color="#fff" size={25} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
