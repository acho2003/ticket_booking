import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { authStorage, mobileApiFetch } from "../lib/api";
import { sharedStyles } from "../lib/theme";

export function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const result = await mobileApiFetch<{ token: string }>(
        mode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body:
            mode === "login"
              ? { email, password }
              : { name, email, phone, password }
        }
      );

      await authStorage.setToken(result.token);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Authentication failed", error instanceof Error ? error.message : "Please try again");
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <View style={sharedStyles.card}>
        <Text style={sharedStyles.title}>{mode === "login" ? "Login" : "Register"}</Text>
        <Text style={sharedStyles.subtitle}>Reserve tickets and keep track of booking codes.</Text>
        <View style={{ flexDirection: "row", gap: 10, marginVertical: 16 }}>
          <Pressable style={mode === "login" ? sharedStyles.button : sharedStyles.buttonSecondary} onPress={() => setMode("login")}>
            <Text style={mode === "login" ? sharedStyles.buttonText : sharedStyles.buttonSecondaryText}>Login</Text>
          </Pressable>
          <Pressable style={mode === "register" ? sharedStyles.button : sharedStyles.buttonSecondary} onPress={() => setMode("register")}>
            <Text style={mode === "register" ? sharedStyles.buttonText : sharedStyles.buttonSecondaryText}>Register</Text>
          </Pressable>
        </View>
        {mode === "register" ? <TextInput style={sharedStyles.input} placeholder="Full name" value={name} onChangeText={setName} /> : null}
        <TextInput style={sharedStyles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
        {mode === "register" ? <TextInput style={sharedStyles.input} placeholder="Phone" value={phone} onChangeText={setPhone} /> : null}
        <TextInput style={sharedStyles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable style={[sharedStyles.button, { marginTop: 16 }]} onPress={submit}>
          <Text style={sharedStyles.buttonText}>{mode === "login" ? "Login" : "Create Account"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
