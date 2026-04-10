import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";

const SYSTEM_PROMPT = `You are MitiGo, an AI assistant for MitigatePlus — a disaster risk mitigation system for Manila residents. 
You help residents understand disaster risks, provide mitigation advice, explain hazard zones, and guide them on emergency preparedness.
Focus only on disaster risk mitigation topics. Be friendly, clear, and helpful. Keep answers concise.`;

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm MitiGo, your disaster risk assistant. How can I help you stay safe today? 🛡️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "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",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await response.json();
      const reply =
        data.content?.[0]?.text || "Sorry, I could not process that.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="AI Assistant" />
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            {msg.role === "assistant" && (
              <Text style={styles.botName}>🤖 MitiGo</Text>
            )}
            <Text
              style={[
                styles.bubbleText,
                msg.role === "user" && styles.userText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.botBubble}>
            <ActivityIndicator size="small" color="#2e7d32" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about disaster risks..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  messages: { flex: 1 },
  bubble: { maxWidth: "80%", borderRadius: 12, padding: 12, marginBottom: 12 },
  botBubble: { backgroundColor: "#fff", alignSelf: "flex-start", elevation: 1 },
  userBubble: { backgroundColor: "#2e7d32", alignSelf: "flex-end" },
  botName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 4,
  },
  bubbleText: { fontSize: 14, color: "#333", lineHeight: 20 },
  userText: { color: "#fff" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendBtnText: { color: "#fff", fontWeight: "700" },
});

export default ChatbotScreen;
