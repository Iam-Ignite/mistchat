import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from "../firebaseConfig"; // Make sure db is correctly imported

const MessageSection = ({ username, receiverUsername }: any) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesCollection = collection(db, 'messages');

  // Function to send a message
  const sendMessage = async () => {
    if (message.trim() !== '') {
      try {
        setLoading(true);

        await addDoc(messagesCollection, {
          sender: username,
          receiver: receiverUsername,
          messageText: message,
          timestamp: Timestamp.fromDate(new Date()), // Using Firebase's timestamp
        });

        setMessage(''); // Clear message input
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetching messages in real-time
  useEffect(() => {
    // Ensure both `username` and `receiverUsername` are defined
    if (!username || !receiverUsername) {
      console.error('Username or receiverUsername is undefined');
      return;
    }
  
    const q = query(
      messagesCollection,
      where('sender', 'in', [username, receiverUsername]),
      where('receiver', 'in', [username, receiverUsername]),
      orderBy('timestamp')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, [username, receiverUsername]);
  useEffect(() => {
    console.log('Username:', username);
    console.log('Receiver Username:', receiverUsername);
  }, [username, receiverUsername]);
  
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, backgroundColor: item.sender === username ? '#0077CC' : '#f0f0f0', marginBottom: 5, borderRadius: 8 }}>
            <Text style={{ color: item.sender === username ? 'white' : 'black' }}>
              {item.messageText}
            </Text>
            <Text style={{ color: item.sender === username ? 'white' : 'black', fontSize: 12 }}>
              {new Date(item.timestamp.seconds * 1000).toLocaleString()}
            </Text>
          </View>
        )}
      />
      <KeyboardAvoidingView style={{ flexDirection: 'row', padding: 10 }} behavior="padding">
        <TextInput
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
          }}
          placeholder="Type a message"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={loading}
          style={{
            backgroundColor: '#0077CC',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            marginLeft: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {loading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageSection;
