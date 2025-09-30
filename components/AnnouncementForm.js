import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function AnnouncementForm() {
  const [text, setText] = useState("");

  const postAnnouncement = async () => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "announcements"), {
        text,
        createdAt: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : "unknown",
      });
      setText(""); // clear input after posting
      alert("✅ Announcement posted successfully!");
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("❌ Failed to post announcement");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your announcement..."
        style={styles.input}
      />
      <TouchableOpacity onPress={postAnnouncement} style={styles.button}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
