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
import API from "../services/api";

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    barangay: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { ...form, role: "resident" });
      Alert.alert("✅ Success!", "Account created! Please login.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      icon: "person-outline",
      placeholder: "Juan dela Cruz",
      type: "default",
    },
    {
      key: "email",
      label: "Email Address",
      icon: "mail-outline",
      placeholder: "juan@email.com",
      type: "email-address",
    },
    {
      key: "password",
      label: "Password",
      icon: "lock-closed-outline",
      placeholder: "Create a password",
      type: "default",
      secure: true,
    },
    {
      key: "barangay",
      label: "Barangay",
      icon: "location-outline",
      placeholder: "e.g. Barangay 123",
      type: "default",
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.banner}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.shieldIcon}>
            <Ionicons name="person-add" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.appTagline}>Join MitigatePlus Community</Text>
        </View>

        <View style={styles.card}>
          {fields.map((f) => (
            <View key={f.key} style={styles.fieldBox}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name={f.icon}
                  size={18}
                  color="#1565c0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={f.placeholder}
                  placeholderTextColor="#aaa"
                  value={form[f.key]}
                  onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                  keyboardType={f.type}
                  autoCapitalize={f.key === "email" ? "none" : "words"}
                  secureTextEntry={f.secure && !showPass}
                />
                {f.secure && (
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
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerBtnText}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <Text
              style={[
                styles.loginLinkText,
                { color: "#1565c0", fontWeight: "700" },
              ]}
            >
              Login
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
    paddingTop: 50,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  appName: { color: "#fff", fontSize: 24, fontWeight: "800" },
  appTagline: { color: "#90caf9", fontSize: 12, marginTop: 4 },
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
  fieldBox: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e3f2fd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#f8fbff",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 10 },
  registerBtn: {
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
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginLink: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  loginLinkText: { fontSize: 14, color: "#888" },
  footer: { textAlign: "center", color: "#aaa", fontSize: 11, padding: 20 },
});

export default RegisterScreen;
