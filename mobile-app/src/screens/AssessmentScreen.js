import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import API from "../services/api";
import Header from "../components/Header";

const questions = [
  {
    id: 1,
    question: "What type of house do you live in?",
    options: ["Concrete", "Semi-concrete", "Wood", "Light materials"],
  },
  {
    id: 2,
    question: "How old is your house?",
    options: [
      "Less than 5 years",
      "5-15 years",
      "15-30 years",
      "More than 30 years",
    ],
  },
  {
    id: 3,
    question: "Is your area near a body of water?",
    options: ["No", "Within 500m", "Within 100m", "Directly beside"],
  },
  {
    id: 4,
    question: "Does your area experience flooding?",
    options: ["Never", "Rarely", "Sometimes", "Every rainy season"],
  },
  {
    id: 5,
    question: "Do you have an emergency plan?",
    options: ["Yes, detailed plan", "Basic plan", "Informal plan", "No plan"],
  },
];

const AssessmentScreen = () => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (qId, answer) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const calculateRisk = () => {
    const scores = { 0: 1, 1: 2, 2: 3, 3: 4 };
    let total = 0;
    questions.forEach((q) => {
      const idx = q.options.indexOf(answers[q.id]);
      total += scores[idx] || 0;
    });
    if (total <= 8) return { level: "low", score: total };
    if (total <= 14) return { level: "moderate", score: total };
    return { level: "high", score: total };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert("Incomplete", "Please answer all questions");
      return;
    }
    setLoading(true);
    const risk = calculateRisk();
    const recommendations = {
      low: [
        "Maintain your emergency kit",
        "Stay informed about weather updates",
        "Know your evacuation routes",
      ],
      moderate: [
        "Reinforce weak parts of your home",
        "Prepare a 3-day emergency kit",
        "Join community disaster drills",
      ],
      high: [
        "Consider relocating to a safer area",
        "Immediately prepare emergency supplies",
        "Coordinate with your barangay DRRM office",
      ],
    };
    try {
      await API.post("/assessments", {
        answers,
        riskScore: risk.score,
        riskLevel: risk.level,
        recommendations: recommendations[risk.level],
      });
      setResult({ ...risk, recommendations: recommendations[risk.level] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { low: "#2e7d32", moderate: "#f57c00", high: "#c62828" };

  return (
    <View style={styles.container}>
      <Header title="Risk Assessment" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
        {!result ? (
          <>
            {questions.map((q) => (
              <View key={q.id} style={styles.questionBox}>
                <Text style={styles.question}>
                  {q.id}. {q.question}
                </Text>
                {q.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.option,
                      answers[q.id] === opt && styles.optionActive,
                    ]}
                    onPress={() => handleAnswer(q.id, opt)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answers[q.id] === opt && styles.optionTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? "Calculating..." : "Submit Assessment"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Assessment Result</Text>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: riskColors[result.level] },
              ]}
            >
              <Text style={styles.riskText}>
                {result.level.toUpperCase()} RISK
              </Text>
              <Text style={styles.riskScore}>Score: {result.score}/20</Text>
            </View>
            <Text style={styles.recTitle}>Recommendations:</Text>
            {result.recommendations.map((rec, i) => (
              <View key={i} style={styles.recItem}>
                <Text style={styles.recText}>✅ {rec}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              <Text style={styles.retakeBtnText}>Retake Assessment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  scroll: { flex: 1 },
  questionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  question: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  optionActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  optionText: { fontSize: 14, color: "#444" },
  optionTextActive: { color: "#fff" },
  submitBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 32,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  riskBadge: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  riskText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  riskScore: { color: "#fff", fontSize: 16, marginTop: 4 },
  recTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  recItem: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recText: { fontSize: 14, color: "#444" },
  retakeBtn: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  retakeBtnText: { color: "#fff", fontWeight: "600" },
});

export default AssessmentScreen;
