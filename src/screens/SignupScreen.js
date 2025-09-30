impoimport React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date()
      });
      navigation.replace("Login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10 }} />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
        }
