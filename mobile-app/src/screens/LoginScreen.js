import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      await login(res.data.user, res.data.token);
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Wave Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerInner}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
            </View>
            <Text style={styles.appName}>MitigatePlus</Text>
            <Text style={styles.appTagline}>
              City of Manila Disaster Risk Mitigation
            </Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSub}>
            Please verify your identity to proceed
          </Text>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#1565c0"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#1565c0"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginBtnText}>Logging in...</Text>
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>Don't have an account? </Text>
            <Text
              style={[
                styles.registerLinkText,
                { color: "#1565c0", fontWeight: "700" },
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          © 2025 MitigatePlus · City of Manila MDRRMO
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#f0f4ff" },
  banner: {
    backgroundColor: "#1565c0",
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  bannerInner: { alignItems: "center" },
  shieldIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  appName: { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  appTagline: {
    color: "#90caf9",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    marginTop: -24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 4,
  },
  welcomeSub: { fontSize: 13, color: "#888", marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e3f2fd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    backgroundColor: "#f8fbff",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 10 },
  loginBtn: {
    backgroundColor: "#1565c0",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerLinkText: { fontSize: 14, color: "#888" },
  footer: { textAlign: "center", color: "#aaa", fontSize: 11, padding: 20 },
});

export default LoginScreen;
