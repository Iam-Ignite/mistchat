import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UsernameModal = ({ isVisible, onClose, onSubmit }: any) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false); // To handle the loading state

  const handleSave = async () => {
    if (username.trim() !== "") {
      try {
        setLoading(true);

        const userId = Math.floor(100000 + Math.random() * 900000).toString();

        const userData = {
          id: userId,
          username,
          text: "Ask me anything",
        };

        const usernameCollection = collection(db, "users");
        await addDoc(usernameCollection, userData);

        await AsyncStorage.setItem("user", JSON.stringify(userData));

        if (onSubmit) {
          onSubmit(userData); // Ensure parent uses this correctly
        }

        setUsername("");
        onClose();
      } catch (error) {
        console.error("Error saving username:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="slide">
      <View
        className="bg-[#4F54C1]"
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <View className="flex-1 pt-20 pb-52 justify-between">
          <View className="items-center">
            <Image
              source={require("../assets/images/lucide_venetian-mask.png")} // Replace with the actual image source
              className="w-28 h-28"
            />
            <Text className="font-extrabold text-3xl text-white">MistChat</Text>
            <Text className="font-medium text-2xl text-gray-300">
              Anonymous
            </Text>
          </View>
          <View>
            <Text style={{
            
                fontSize:25
              }} className="font-bold text-center text-2xl text-white">
              Write your nickname
            </Text>
            <Text
              className="font-normal mt-2 text-center  px-10"
              style={{
                color: "#F0F4FF", // Off-white color for better contrast
                backgroundColor: "#4F54C1", // Existing background color
                fontSize:18
              }}
            >
              Create an anonymous chat room and receive messages from admirers
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "white",
            width: "100%",
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
          }}
          className="rounded-t-[3rem]"
        >
          <View
            // colors={["#f4f4f4", "#f4f4f4"]}
            style={{
              width: "100%",
              // margin:10,
              marginVertical: 20,
              borderRadius: 50,
              backgroundColor: "#f4f4f4",
            }}
          >
            <TextInput
              placeholder="Enter username"
              className="bg-transparent text-center w-full"
              value={username}
              onChangeText={setUsername}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#E5E7EB",
                fontSize: 18,
                padding: 15,
                borderRadius: 50,
                shadowColor: "#f4f4f4",
                shadowOffset: {
                  width: 2,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                // Shadow for Android
                elevation: 2,
              }}
              placeholderTextColor="gray"
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {/* <TouchableOpacity
              style={{
                backgroundColor: "#E63946",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity> */}
            <View
              style={{
                width: "100%",
                // margin:10,
                borderRadius: 50,
                backgroundColor: "#0077CC",
              }}
            >
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderRadius: 50,
                }}
                className="w-full rounded-full"
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text
                    className="text-center rou"
                    style={{ color: "white", fontSize: 20, fontWeight: "600" }}
                  >
                    Start
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text
            className="text-center font-light my-5"
            style={{ fontSize: 14, marginBottom: 10 }}
          >
            By continuing, you accept the Terms of Use and agree to the privacy
            policy
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default UsernameModal;
