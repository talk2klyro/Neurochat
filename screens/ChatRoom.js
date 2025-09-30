import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { db, auth, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";

export default function ChatRoom({ route }) {
  const { tribeId, tribeName } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // 🔹 Load messages in real-time
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

  // 🔹 Send text/image/voice message
  const sendMessage = async (extraData = {}) => {
    if (!input.trim() && !extraData.url) return;

    const messagesRef = collection(db, "tribes", tribeId, "messages");
    await addDoc(messagesRef, {
      text: input || "",
      userId: auth.currentUser ? auth.currentUser.uid : "guest",
      createdAt: serverTimestamp(),
      ...extraData,
    });

    setInput("");
  };

  // 🔹 Pick and send image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `tribes/${tribeId}/images/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      sendMessage({ url, type: "image" });
    }
  };

  // 🔹 Start recording
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // 🔹 Stop recording and upload
  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `tribes/${tribeId}/voices/${Date.now()}.m4a`);
    await uploadBytes(fileRef, blob);
    const url = await getDownloadURL(fileRef);

    sendMessage({ url, type: "voice" });
  };

  // 🔹 Play/Pause voice messages
  const playVoice = async (message) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: message.url,
      });
      setSound(newSound);
      setPlayingId(message.id);

      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{tribeName} Chat</Text>

      {/* 🔹 Message List */}
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
            {item.type === "image" ? (
              <Image
                source={{ uri: item.url }}
                style={{ width: 150, height: 150, borderRadius: 8 }}
              />
            ) : item.type === "voice" ? (
              <TouchableOpacity onPress={() => playVoice(item)}>
                <Text style={styles.messageText}>
                  {playingId === item.id ? "⏸️ Playing..." : "▶️ Play Voice Note"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
          </View>
        )}
      />

      {/* 🔹 Input Controls */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={() => sendMessage()} style={styles.sendButton}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Text>🖼️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.iconButton}
        >
          <Text>{recording ? "⏹️" : "🎤"}</Text>
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
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconButton: { marginLeft: 8 },
});
