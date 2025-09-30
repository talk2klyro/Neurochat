import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminPostAnnouncement() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const postAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Please enter both title and message.");
      return;
    }

    await addDoc(collection(db, "announcements"), {
      title,
      message,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setMessage("");
    Alert.alert("Success", "Announcement posted!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>✍️ New Announcement</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Message"
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={styles.button} onPress={postAnnouncement}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
