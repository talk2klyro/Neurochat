import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { db } from "../firebaseConfig"; // already set with .env
import { collection, onSnapshot } from "firebase/firestore";

export default function TribeListScreen({ navigation }) {
  const [tribes, setTribes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tribes"), (snapshot) => {
      const tribeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTribes(tribeData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading tribes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Your Tribe</Text>
      <FlatList
        data={tribes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tribeCard}
            onPress={() => navigation.navigate("ChatRoom", { tribeId: item.id, tribeName: item.name })}
          >
            <Text style={styles.tribeName}>{item.name}</Text>
            <Text style={styles.tribeDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tribeCard: {
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 12,
  },
  tribeName: {
    fontSize: 18,
    fontWeight: "600",
  },
  tribeDesc: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
