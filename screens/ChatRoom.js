import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export default function ChatRoom({ route }) {
  const { tribeId, tribeName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const messagesRef = collection(db, "tribes", tribeId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(allMessages);
    });

    return () => unsubscribe();
  }, [tribeId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messagesRef = collection(db, "tribes", tribeId, "messages");
    await addDoc(messagesRef, {
      text: input,
      userId: auth.currentUser ? auth.currentUser.uid : "guest",
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{tribeName} Chat</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.userId === (auth.currentUser?.uid || "guest")
                ? styles.myMessage
                : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "75%",
  },
  myMessage: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
  messageText: { color: "#000" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 20, marginRight: 8 },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});
