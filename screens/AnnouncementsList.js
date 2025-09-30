import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(all);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📢 Announcements</Text>

      {announcements.length === 0 ? (
        <Text style={styles.empty}>No announcements yet</Text>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.time}>
                {item.createdAt?.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : "Just now"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  empty: { color: "#999", textAlign: "center", marginTop: 20 },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
    marginBottom: 10,
  },
  text: { fontSize: 16, marginBottom: 6 },
  time: { fontSize: 12, color: "#555" },
});
