import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
impoimport React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Signup" onPress={() => navigation.navigate("Signup")} />
    </View>
  );
        }
