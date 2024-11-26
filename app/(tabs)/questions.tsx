import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Share,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

type Message = {
  id: string;
  sender: string;
  isOpen: boolean;
  question: string;
  messageText: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
};

const QuestionsScreen: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const modalContentRef = useRef<View>(null); // Reference for the modal content

  const fetchUsername = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUsername(parsedUser.username);
    }
  };

  const openModal = async (message: Message): Promise<void> => {
    setSelectedMessage(message);
    setIsModalVisible(true);

    if (!message.isOpen && username) {
      try {
        const messageDoc = doc(db, "users", username, "messages", message.id);
        await updateDoc(messageDoc, { isOpen: true });
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === message.id ? { ...msg, isOpen: true } : msg
          )
        );
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
  };

  const shareChatLink = async () => {
    try {
      if (!modalContentRef.current) return;

      // Capture the screenshot
      const uri = await captureRef(modalContentRef, {
        format: "png",
        quality: 1,
      });
      console.log(uri);

      // Share the screenshot
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing screenshot:", error);
    }
  };

  const closeModal = (): void => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  const fetchMessages = async (): Promise<void> => {
    try {
      if (!username) return;

      setLoading(true);
      const userDoc = doc(db, "users", username);
      const messagesCollection = collection(userDoc, "messages");
      const querySnapshot = await getDocs(messagesCollection);

      const fetchedMessages: Message[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use `useFocusEffect` to refresh the page when it becomes active
  useFocusEffect(
    React.useCallback(() => {
      fetchUsername(); // Ensure username is up-to-date
      fetchMessages(); // Refresh messages
    }, [username])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="bg-[#4e54c8]" 
      // colors={["#4e54c8", "#4e54c86c"]}
       style={styles.gradient}>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#FF30CF"
            style={styles.loader}
          />
        )}

        <View className="flex-row py-10 items-center">
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openModal(item)}
                accessible
                accessibilityLabel={`Message from ${item.sender}`}
              >
                <MaterialCommunityIcons
                  name={
                    item.isOpen ? "email-open-outline" : "email-alert-outline"
                  }
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          />
        </View>

        <Modal
          transparent
          animationType="slide"
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View>
              <View className="relative" ref={modalContentRef} style={styles.modalContent}>
                {selectedMessage ? (
                  <View className=" rounded-b-full rounded-tr-full  rounded-tl-full">
                    <View
                      // colors={["#0077CC", "#4e54c8"]}
                      style={{
                        // margin:10,
                        borderRadius: 45,
                        backgroundColor:"#0077CC"
                        // height: ?,
                      }}
                    >
                      <ImageBackground
                        source={require("../../assets/images/questions.png")}
                        resizeMode="contain"
                        style={{
                          height: "auto",
                          width: 290,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View className="p-16 w-auto">
                          <Text
                            style={{
                              fontSize: 24,
                              color: "#fff",
                            }}
                            className="text-center font-bold"
                          >
                            {selectedMessage?.question}
                          </Text>

                          {/* <Text style={styles.timestamp}>
                            {selectedMessage.timestamp
                              ? new Date(
                                  selectedMessage.timestamp.seconds * 1000
                                ).toLocaleString()
                              : "No timestamp available"}
                          </Text> */}
                        </View>
                      </ImageBackground>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#4e54c8",
                      }}
                      className="text-center p-4 font-bold"
                    >
                      {selectedMessage?.messageText}
                    </Text>
                  </View>
                ) : (
                  <Text>No message selected.</Text>
                )}
                <TouchableOpacity className="absolute right-3 top-3" onPress={closeModal}>
                  <AntDesign
                    name="close"
                    color="#4e54c8"
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <View>

                <View
                  // colors={["#0077CC", "#4e54c8"]}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    borderRadius: 50,
                    backgroundColor:"#0077CC"
                  }}
                >
                  <TouchableOpacity
                    onPress={shareChatLink}
                    className="rounded-lg w-full p-3"
                  >
                    <Text
                      style={{ color: "#FFFFFF" }}
                      className="text-center text-[#4e54c8] font-semibold"
                    >
                      Share to friends
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  loader: { marginTop: 16 },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    padding: 16,
  },
  iconButton: {
    margin: 10,
    padding: 5,
    borderRadius: 50,
    width: 65,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: { padding: 12, borderRadius: 8 },
  modalHeaderText: { color: "white", fontWeight: "bold", textAlign: "center" },
  messageLabel: { fontWeight: "bold", marginTop: 10 },
  timestamp: { fontSize: 12, color: "#888", marginTop: 8 },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4e54c8",
    borderRadius: 20,
  },
  closeButtonText: { color: "white", fontWeight: "bold", textAlign: "center" },
});

export default QuestionsScreen;
