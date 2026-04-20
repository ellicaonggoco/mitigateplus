import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../services/api";

// ============================================================
// HAZARD TYPES
// ============================================================
const HAZARD_TYPES = [
  {
    id: "flood",
    label: "Flood",
    icon: "water",
    lib: "Ionicons",
    color: "#1565c0",
    bg: "#e3f2fd",
  },
  {
    id: "fire",
    label: "Fire Hazard",
    icon: "fire",
    lib: "MaterialCommunityIcons",
    color: "#c62828",
    bg: "#ffebee",
  },
  {
    id: "landslide",
    label: "Landslide",
    icon: "landslide",
    lib: "MaterialCommunityIcons",
    color: "#6d4c41",
    bg: "#efebe9",
  },
  {
    id: "faultline",
    label: "Fault Line",
    icon: "pulse",
    lib: "Ionicons",
    color: "#6a1b9a",
    bg: "#f3e5f5",
  },
  {
    id: "typhoon",
    label: "Typhoon",
    icon: "weather-tornado",
    lib: "MaterialCommunityIcons",
    color: "#0277bd",
    bg: "#e1f5fe",
  },
  {
    id: "drainage",
    label: "Drainage Issue",
    icon: "pipe-leak",
    lib: "MaterialCommunityIcons",
    color: "#f57c00",
    bg: "#fff3e0",
  },
  {
    id: "structural",
    label: "Structural Damage",
    icon: "home-alert",
    lib: "MaterialCommunityIcons",
    color: "#546e7a",
    bg: "#eceff1",
  },
];

// ============================================================
// ASSESSMENT QUESTIONS PER HAZARD
// ============================================================
const QUESTIONS = {
  flood: [
    {
      id: 1,
      question:
        "How close is your home to a body of water (river, estero, bay)?",
      options: [
        "More than 500m away",
        "200–500m away",
        "100–200m away",
        "Less than 100m / directly beside",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "Does your area experience flooding?",
      options: [
        "Never",
        "Rarely (once a year)",
        "Sometimes (rainy season)",
        "Every heavy rain",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "What is the typical flood water level in your area?",
      options: [
        "No flooding",
        "Ankle-deep",
        "Knee-deep",
        "Waist-deep or higher",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "How long does floodwater stay in your area?",
      options: [
        "No flooding",
        "Less than 2 hours",
        "Half a day",
        "More than a day",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question: "Is there a functional drainage system near your home?",
      options: [
        "Yes, well-maintained",
        "Yes but rarely cleaned",
        "Partially functional",
        "None or always clogged",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  fire: [
    {
      id: 1,
      question: "What is your house primarily made of?",
      options: [
        "Concrete/Hollow blocks",
        "Concrete with wood parts",
        "Mostly wood",
        "Light/flammable materials",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "How close is the nearest fire station?",
      options: ["Less than 500m", "500m–1km", "1km–3km", "More than 3km"],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "Does your household have a fire extinguisher?",
      options: [
        "Yes, recently inspected",
        "Yes but not inspected",
        "No but planning to buy",
        "No",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "How is your area in terms of density?",
      options: [
        "Spacious, houses are far apart",
        "Moderate spacing",
        "Dense housing",
        "Very dense, houses touching",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question: "Are electrical wirings in your home properly installed?",
      options: [
        "Professionally installed & updated",
        "Professionally installed but old",
        "DIY but appears ok",
        "DIY with visible hazards",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  landslide: [
    {
      id: 1,
      question: "Where is your home located?",
      options: [
        "Flat ground / valley",
        "Slightly elevated area",
        "Hillside / sloped area",
        "Steep slope or cliff",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "What is the soil type around your home?",
      options: [
        "Rocky / stable",
        "Clay but stable",
        "Loose soil",
        "Sandy or highly erosive",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "Is there significant vegetation/trees around your area?",
      options: [
        "Dense trees and vegetation",
        "Moderate vegetation",
        "Sparse plants",
        "Bare soil / no vegetation",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "Has your area experienced landslides before?",
      options: [
        "Never",
        "Once long ago",
        "A few times",
        "Regularly during rains",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question:
        "Are there active construction or excavation activities nearby?",
      options: [
        "None",
        "Far away (>500m)",
        "Within 500m",
        "Adjacent to your home",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  faultline: [
    {
      id: 1,
      question: "How close is your home to a known fault line?",
      options: ["More than 5km", "2–5km", "1–2km", "Less than 1km"],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "What type of foundation does your house have?",
      options: [
        "Deep reinforced concrete",
        "Standard concrete footing",
        "Shallow footing",
        "No formal foundation",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "Has your home experienced earthquake damage before?",
      options: [
        "Never",
        "Minor cracks repaired",
        "Significant cracks",
        "Partial collapse",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question:
        "Is your building earthquake-resistant (designed for seismic activity)?",
      options: [
        "Yes, certified",
        "Partially reinforced",
        "Old construction, unknown",
        "Not designed for earthquakes",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question: "Do you have an earthquake emergency plan?",
      options: [
        "Yes, practiced regularly",
        "Yes but not practiced",
        "Informal plan only",
        "No plan at all",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  typhoon: [
    {
      id: 1,
      question: "What type of roof does your home have?",
      options: [
        "Reinforced concrete",
        "Metal/GI sheet with bolts",
        "Light metal loosely fixed",
        "Nipa/thatch/light material",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "Are there large trees near your home that could fall?",
      options: [
        "No trees nearby",
        "Small trees only",
        "Large trees but healthy",
        "Large trees showing decay",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "Is your home in a typhoon-prone corridor?",
      options: [
        "Rarely hit by typhoon",
        "Occasionally affected",
        "Often in typhoon path",
        "Always in the direct path",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "Do you have storm shutters or reinforced windows?",
      options: [
        "Yes, all windows",
        "Most windows covered",
        "Some windows covered",
        "No protection",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question: "Do you have a family emergency plan for typhoons?",
      options: [
        "Yes, practiced regularly",
        "Yes but not practiced",
        "Informal plan",
        "No plan",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  drainage: [
    {
      id: 1,
      question: "How often does your street flood due to drainage problems?",
      options: ["Never", "Rarely", "Sometimes", "Every rain"],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "Is the drainage canal near your home maintained?",
      options: [
        "Regularly cleaned",
        "Occasionally cleaned",
        "Rarely cleaned",
        "Never cleaned/clogged",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question:
        "Do you observe illegal waste dumping in canals near your area?",
      options: ["Never", "Rarely", "Sometimes", "Regularly"],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "Is there a proper solid waste collection in your area?",
      options: [
        "Yes, regular schedule",
        "Yes but inconsistent",
        "Rarely",
        "No collection",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question: "How deep is the nearest drainage canal?",
      options: [
        "Deep and wide",
        "Moderate depth",
        "Shallow",
        "Barely a canal / open ditch",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
  structural: [
    {
      id: 1,
      question: "How old is your home structure?",
      options: [
        "Less than 5 years",
        "5–15 years",
        "15–30 years",
        "More than 30 years",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 2,
      question: "Are there visible cracks in your walls or foundation?",
      options: [
        "No cracks",
        "Hairline cracks only",
        "Moderate cracks",
        "Wide/deep cracks",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 3,
      question: "Has your home been inspected by a structural engineer?",
      options: [
        "Yes, recently",
        "Yes but long ago",
        "Never but looks ok",
        "Never",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 4,
      question: "Has your home undergone major renovation or extension?",
      options: [
        "Yes, with proper permits",
        "Yes but no permits",
        "Minor repairs only",
        "No renovation",
      ],
      scores: [1, 2, 3, 4],
    },
    {
      id: 5,
      question:
        "Are the columns and beams of your home visible and in good condition?",
      options: [
        "Excellent condition",
        "Minor wear",
        "Visible damage",
        "Severely compromised",
      ],
      scores: [1, 2, 3, 4],
    },
  ],
};

// ============================================================
// RECOMMENDATIONS PER HAZARD AND RISK LEVEL
// ============================================================
const RECOMMENDATIONS = {
  flood: {
    low: {
      evaluation:
        "Your home has LOW flood risk. You are relatively safe from flooding.",
      tips: [
        "Keep drainage clean and free of debris monthly",
        "Prepare a basic emergency kit with 3-day supplies",
        "Know your nearest evacuation center location",
        "Monitor PAGASA weather advisories during rainy season",
        "Install check valves in plumbing to prevent sewage backup",
      ],
      actions: [
        "Subscribe to PAGASA flood alerts",
        "Join your Barangay DRRM committee",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE flood risk. Take preventive measures to reduce damage.",
      tips: [
        "Elevate electrical outlets and appliances above potential flood level",
        "Install flood barriers or sandbags at entry points",
        "Move important documents to waterproof containers or upper floors",
        "Prepare a 72-hour emergency bag with food, water, and medicine",
        "Identify and clear nearby drainage blockages regularly",
        "Consider waterproofing your ground floor walls",
      ],
      actions: [
        "Register with Barangay for flood early warning",
        "Build a small flood wall around your property",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH flood risk. Immediate action is required to ensure safety.",
      tips: [
        "STRONGLY consider temporary or permanent relocation to higher ground",
        "Install elevated flooring or raise ground level of your property",
        "Never stay in a flood-prone area during heavy rains",
        "Keep life-saving equipment: life vest, rope, flashlight",
        "Establish a family evacuation plan with multiple escape routes",
        "Store 1-week emergency supplies on upper floor",
        "Coordinate with MDRRMO for your household flood risk assessment",
      ],
      actions: [
        "Contact MDRRMO for relocation assistance",
        "Apply for DSWD housing assistance if eligible",
      ],
    },
  },
  fire: {
    low: {
      evaluation:
        "Your home has LOW fire risk. Maintain your current safety practices.",
      tips: [
        "Test smoke detectors monthly and replace batteries annually",
        "Keep a fire extinguisher accessible in the kitchen",
        "Never leave cooking unattended",
        "Store flammable materials away from heat sources",
        "Create and practice a family fire escape plan",
      ],
      actions: [
        "Schedule annual electrical inspection",
        "Register your home with BFP for fire safety check",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE fire risk. Improvements are needed to prevent fire incidents.",
      tips: [
        "Have a licensed electrician inspect and upgrade old wiring immediately",
        "Install smoke detectors in every room",
        "Keep at least 2 fire extinguishers — kitchen and bedroom area",
        "Clear clutter and flammable materials from your home",
        "Ensure all family members know how to use a fire extinguisher",
        "Create at least 2 fire exit routes from your home",
      ],
      actions: [
        "Request free BFP fire safety inspection",
        "Replace all old electrical wiring within 6 months",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH fire risk. Urgent safety measures must be implemented.",
      tips: [
        "Immediately have all electrical systems professionally inspected and repaired",
        "Replace all light/flammable construction materials where possible",
        "Install fire-rated doors and materials",
        "Maintain a clear perimeter around your home to prevent fire spread",
        "Install a residential sprinkler system if possible",
        "Ensure your full address is clearly posted for BFP emergency response",
        "Conduct monthly family fire drills",
      ],
      actions: [
        "Contact BFP for urgent fire risk consultation",
        "Apply for DILG housing improvement program",
      ],
    },
  },
  landslide: {
    low: {
      evaluation:
        "Your home has LOW landslide risk. Your location is relatively stable.",
      tips: [
        "Plant trees and ground cover plants to stabilize soil",
        "Maintain proper drainage around your home",
        "Avoid removing vegetation on slopes near your property",
        "Monitor soil conditions during prolonged heavy rains",
        "Know warning signs: unusual sounds, tilting trees, cracks in ground",
      ],
      actions: [
        "Monitor PHIVOLCS advisories regularly",
        "Join community slope monitoring program",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE landslide risk. Take slope stabilization measures.",
      tips: [
        "Install retaining walls or slope reinforcement structures",
        "Plant deep-rooted vegetation to stabilize slopes",
        "Install proper surface drainage to divert water from slopes",
        "Avoid heavy construction or excavation near slopes",
        "Evacuate immediately if you notice ground movement or unusual sounds",
        "Monitor cracks in walls, floors, and ground regularly",
      ],
      actions: [
        "Request PHIVOLCS slope stability assessment",
        "Apply for DPWH slope stabilization program",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH landslide risk. Evacuation planning is critical.",
      tips: [
        "STRONGLY consider relocation away from slope areas",
        "Never stay in your home during prolonged heavy rains",
        "Establish emergency evacuation routes on stable ground",
        "Install early warning sensors if available through LGU",
        "Build or reinforce retaining walls urgently",
        "Report ground movement to MDRRMO immediately",
      ],
      actions: [
        "Request urgent PHIVOLCS ground assessment",
        "Contact NDRRMC for relocation assistance",
      ],
    },
  },
  faultline: {
    low: {
      evaluation:
        "Your home has LOW earthquake/fault line risk based on your answers.",
      tips: [
        "Secure heavy furniture and appliances to walls",
        "Keep emergency kit with water, food, first aid for 72 hours",
        "Practice Drop, Cover, Hold On drill with your family",
        "Know the safe spots in each room of your home",
        "Store breakable items in low, closed cabinets",
      ],
      actions: [
        "Follow PHIVOLCS earthquake advisories",
        "Join barangay earthquake drill",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE earthquake risk. Structural reinforcement is advised.",
      tips: [
        "Have a structural engineer assess your home for seismic compliance",
        "Reinforce walls with steel mesh and additional concrete",
        "Install flexible gas line connections to prevent leaks during quake",
        "Secure water heater and gas tanks to walls",
        "Keep a fire extinguisher ready — earthquakes often cause fires",
        "Identify and repair existing cracks in walls and foundation",
      ],
      actions: [
        "Request DPWH structural assessment",
        "Apply for earthquake retrofitting assistance",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH earthquake risk. Immediate retrofitting or relocation needed.",
      tips: [
        "URGENTLY consult a structural engineer for earthquake retrofitting",
        "Consider relocation if your home cannot be safely retrofitted",
        "Never shelter under doorframes — use solid tables or desks instead",
        "Prepare a 1-week emergency supply cache outside your home",
        "Establish family meeting points far from buildings",
        "Know all utility shutoff locations: gas, water, electricity",
        "Keep shoes near your bed for post-earthquake debris navigation",
      ],
      actions: [
        "Contact PHIVOLCS for proximity to West Valley Fault assessment",
        "Apply for HUDCC housing relocation program",
      ],
    },
  },
  typhoon: {
    low: {
      evaluation:
        "Your home has LOW typhoon risk. Basic preparedness is sufficient.",
      tips: [
        "Trim trees near your home before typhoon season",
        "Secure loose items in your yard before storms",
        "Prepare a 3-day emergency kit",
        "Know your nearest evacuation center",
        "Monitor PAGASA typhoon advisories during June–November",
      ],
      actions: [
        "Register with Barangay for typhoon early warning SMS",
        "Check roof condition before June",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE typhoon risk. Structural reinforcement recommended.",
      tips: [
        "Reinforce roof connections with hurricane straps",
        "Install storm shutters or plywood covers for windows",
        "Waterproof your roof and seal all gaps",
        "Prepare a 72-hour emergency bag for each family member",
        "Know multiple evacuation routes from your home",
        "Secure your gas tank and outdoor fixtures",
      ],
      actions: [
        "Request DPWH home assessment for typhoon resilience",
        "Pre-position sandbags before rainy season",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH typhoon risk. Major structural improvements are needed.",
      tips: [
        "Upgrade to reinforced concrete roofing if possible",
        "Install impact-resistant windows and doors",
        "Always evacuate when Signal No. 3 or higher is raised in your area",
        "Never wait for floodwaters before evacuating",
        "Prepare 1-week emergency supplies and important documents",
        "Know pre-designated evacuation centers and routes",
        "Coordinate with Barangay for assisted evacuation",
      ],
      actions: [
        "Apply for DSWD typhoon-resilient housing program",
        "Pre-register family with Barangay for evacuation priority",
      ],
    },
  },
  drainage: {
    low: {
      evaluation: "Your area has LOW drainage risk. Keep up with maintenance.",
      tips: [
        "Dispose of solid waste properly — never in canals",
        "Report blocked drains to Barangay maintenance team",
        "Use permeable materials for driveways to reduce runoff",
        "Avoid pouring grease or oil into sinks",
        "Participate in community canal cleanup drives",
      ],
      actions: [
        "Join monthly Barangay clean-up drives",
        "Report drainage issues to MMDA",
      ],
    },
    moderate: {
      evaluation:
        "Your area has MODERATE drainage issues. Community action is needed.",
      tips: [
        "Advocate for regular canal desilting in your Barangay",
        "Install a trash trap in your household drainage",
        "Keep your street gutter clear of debris weekly",
        "Avoid building structures over drainage canals",
        "Monitor water levels during heavy rains and alert neighbors",
      ],
      actions: [
        "Petition Barangay for drainage improvement project",
        "Report to MMDA Drainage Division",
      ],
    },
    high: {
      evaluation:
        "Your area has HIGH drainage risk. Infrastructure improvements urgently needed.",
      tips: [
        "Lobby your local officials for drainage infrastructure improvement",
        "Elevate ground floor of your home above street level",
        "Install pumping equipment for flood water removal",
        "Coordinate with neighbors for communal drainage maintenance",
        "Never enter floodwaters — risk of disease and hidden hazards",
        "Report to MMDA and City Engineering for urgent drainage repair",
      ],
      actions: [
        "File formal complaint with City Engineering Office",
        "Request MMDA Flood Control urgent assessment",
      ],
    },
  },
  structural: {
    low: {
      evaluation:
        "Your home has LOW structural risk. Regular maintenance will keep it safe.",
      tips: [
        "Inspect your home for cracks every 6 months",
        "Maintain proper waterproofing on roof and walls",
        "Keep gutters clean to prevent water damage",
        "Address minor cracks immediately before they worsen",
        "Ensure proper ventilation to prevent moisture damage",
      ],
      actions: [
        "Schedule annual home inspection",
        "Document condition of your home with photos",
      ],
    },
    moderate: {
      evaluation:
        "Your home has MODERATE structural risk. Professional assessment recommended.",
      tips: [
        "Hire a licensed civil engineer for structural inspection",
        "Repair all visible cracks with appropriate sealant or grout",
        "Check and reinforce roof structure connections",
        "Ensure proper drainage away from your foundation",
        "Do not add heavy loads to upper floors without engineering assessment",
        "Waterproof basement and ground floor walls",
      ],
      actions: [
        "Apply for DPWH free structural assessment",
        "Request Barangay housing improvement subsidy",
      ],
    },
    high: {
      evaluation:
        "Your home has HIGH structural risk. Immediate professional intervention needed.",
      tips: [
        "STOP using severely compromised areas of your home immediately",
        "Consult a licensed structural engineer for urgent assessment",
        "Consider temporary evacuation if foundation is compromised",
        "Do not attempt DIY repairs on structural elements",
        "Document all damage for insurance or government assistance claims",
        "Contact DSWD or NHA for emergency housing assistance",
        "Avoid staying during earthquakes, heavy rains, or strong winds",
      ],
      actions: [
        "Contact DPWH urgently for structural condemnation assessment",
        "Apply for NHA emergency housing assistance",
      ],
    },
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const AssessmentScreen = () => {
  const [step, setStep] = useState("select"); // select | questions | result
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectHazard = (hazard) => {
    setSelectedHazard(hazard);
    setAnswers({});
    setStep("questions");
  };

  const handleAnswer = (qId, optionIndex, score) => {
    setAnswers((prev) => ({ ...prev, [qId]: { option: optionIndex, score } }));
  };

  const handleSubmit = async () => {
    const questions = QUESTIONS[selectedHazard.id];
    if (Object.keys(answers).length < questions.length) {
      Alert.alert(
        "Incomplete",
        "Please answer all questions before submitting.",
      );
      return;
    }

    setLoading(true);
    const totalScore = Object.values(answers).reduce(
      (sum, a) => sum + a.score,
      0,
    );
    const maxScore = questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    let riskLevel;
    if (percentage <= 35) riskLevel = "low";
    else if (percentage <= 65) riskLevel = "moderate";
    else riskLevel = "high";

    const rec = RECOMMENDATIONS[selectedHazard.id][riskLevel];

    try {
      await API.post("/assessments", {
        answers,
        riskScore: totalScore,
        riskLevel,
        hazardType: selectedHazard.id,
        recommendations: rec.tips,
      });
    } catch (err) {
      console.error(err);
    }

    setResult({ riskLevel, totalScore, maxScore, percentage, rec });
    setLoading(false);
    setStep("result");
  };

  const handleReset = () => {
    setStep("select");
    setSelectedHazard(null);
    setAnswers({});
    setResult(null);
  };

  const renderIcon = (hazard, size = 26, color) => {
    if (hazard.lib === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={hazard.icon}
          size={size}
          color={color || hazard.color}
        />
      );
    }
    return (
      <Ionicons name={hazard.icon} size={size} color={color || hazard.color} />
    );
  };

  const riskColors = { low: "#2e7d32", moderate: "#f57c00", high: "#c62828" };
  const riskBg = { low: "#e8f5e9", moderate: "#fff3e0", high: "#ffebee" };
  const riskLabels = {
    low: "LOW RISK",
    moderate: "MODERATE RISK",
    high: "HIGH RISK",
  };
  const riskIcons = {
    low: "checkmark-circle",
    moderate: "warning",
    high: "alert-circle",
  };

  // ---- STEP 1: SELECT HAZARD ----
  if (step === "select") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <Ionicons name="clipboard" size={22} color="#fff" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Risk Assessment</Text>
            <Text style={styles.headerSub}>Select a hazard type to assess</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16 }}
        >
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1565c0" />
            <Text style={styles.infoText}>
              Each hazard has its own assessment. Select the hazard you want to
              evaluate for your home and area.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Choose Hazard Type:</Text>
          <View style={styles.hazardGrid}>
            {HAZARD_TYPES.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[styles.hazardCard, { borderTopColor: h.color }]}
                onPress={() => handleSelectHazard(h)}
                activeOpacity={0.85}
              >
                <View style={[styles.hazardIconBox, { backgroundColor: h.bg }]}>
                  {renderIcon(h, 28)}
                </View>
                <Text style={styles.hazardLabel}>{h.label}</Text>
                <Text style={styles.hazardSub}>5 questions</Text>
                <View style={[styles.startBtn, { backgroundColor: h.color }]}>
                  <Text style={styles.startBtnText}>Start →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- STEP 2: QUESTIONS ----
  if (step === "questions") {
    const questions = QUESTIONS[selectedHazard.id];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <View style={styles.container}>
        <View
          style={[styles.header, { backgroundColor: selectedHazard.color }]}
        >
          <TouchableOpacity
            onPress={() => setStep("select")}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View
            style={[
              styles.headerIconBox,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            {renderIcon(selectedHazard, 22, "#fff")}
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.headerTitle}>
              {selectedHazard.label} Assessment
            </Text>
            <Text style={styles.headerSub}>
              {answeredCount} of {questions.length} answered
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: selectedHazard.color },
            ]}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {questions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View
                  style={[
                    styles.qNumBadge,
                    { backgroundColor: selectedHazard.color },
                  ]}
                >
                  <Text style={styles.qNum}>{q.id}</Text>
                </View>
                <Text style={styles.questionText}>{q.question}</Text>
              </View>
              {q.options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.option,
                    answers[q.id]?.option === idx && {
                      backgroundColor: selectedHazard.color,
                      borderColor: selectedHazard.color,
                    },
                  ]}
                  onPress={() => handleAnswer(q.id, idx, q.scores[idx])}
                >
                  <View
                    style={[
                      styles.optionRadio,
                      answers[q.id]?.option === idx && {
                        borderColor: "#fff",
                        backgroundColor: "rgba(255,255,255,0.3)",
                      },
                    ]}
                  >
                    {answers[q.id]?.option === idx && (
                      <View style={styles.optionRadioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      answers[q.id]?.option === idx && { color: "#fff" },
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: selectedHazard.color,
                opacity: answeredCount < questions.length ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading || answeredCount < questions.length}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>
                  {answeredCount < questions.length
                    ? `Answer ${questions.length - answeredCount} more question${questions.length - answeredCount > 1 ? "s" : ""}`
                    : "Submit Assessment"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---- STEP 3: RESULT ----
  if (step === "result" && result) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { backgroundColor: riskColors[result.riskLevel] },
          ]}
        >
          <View style={styles.headerIconBox}>
            <Ionicons
              name={riskIcons[result.riskLevel]}
              size={22}
              color="#fff"
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Assessment Result</Text>
            <Text style={styles.headerSub}>
              {selectedHazard.label} Risk Evaluation
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Risk Score Card */}
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: riskBg[result.riskLevel],
                borderColor: riskColors[result.riskLevel],
              },
            ]}
          >
            <View style={styles.resultTop}>
              <Ionicons
                name={riskIcons[result.riskLevel]}
                size={48}
                color={riskColors[result.riskLevel]}
              />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text
                  style={[
                    styles.riskLabel,
                    { color: riskColors[result.riskLevel] },
                  ]}
                >
                  {riskLabels[result.riskLevel]}
                </Text>
                <Text style={styles.riskHazard}>
                  {selectedHazard.label} Assessment
                </Text>
                <Text style={styles.riskScore}>
                  Score: {result.totalScore} / {result.maxScore} (
                  {Math.round(result.percentage)}%)
                </Text>
              </View>
            </View>

            {/* Score Bar */}
            <View style={styles.scoreBarBg}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${result.percentage}%`,
                    backgroundColor: riskColors[result.riskLevel],
                  },
                ]}
              />
            </View>
            <View style={styles.scoreBarLabels}>
              <Text style={{ color: "#2e7d32", fontSize: 11 }}>Low</Text>
              <Text style={{ color: "#f57c00", fontSize: 11 }}>Moderate</Text>
              <Text style={{ color: "#c62828", fontSize: 11 }}>High</Text>
            </View>
          </View>

          {/* Evaluation */}
          <View style={styles.evalBox}>
            <View style={styles.evalHeader}>
              <Ionicons name="document-text" size={18} color="#1565c0" />
              <Text style={styles.evalTitle}>Evaluation</Text>
            </View>
            <Text style={styles.evalText}>{result.rec.evaluation}</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons
                name="bulb"
                size={18}
                color={riskColors[result.riskLevel]}
              />
              <Text
                style={[
                  styles.tipsTitle,
                  { color: riskColors[result.riskLevel] },
                ]}
              >
                Mitigation Tips
              </Text>
            </View>
            {result.rec.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View
                  style={[
                    styles.tipNum,
                    { backgroundColor: riskColors[result.riskLevel] },
                  ]}
                >
                  <Text style={styles.tipNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Action Items */}
          <View style={styles.actionsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons
                name="checkmark-done-circle"
                size={18}
                color="#1565c0"
              />
              <Text style={[styles.tipsTitle, { color: "#1565c0" }]}>
                Recommended Actions
              </Text>
            </View>
            {result.rec.actions.map((action, i) => (
              <View key={i} style={styles.actionRow}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={18}
                  color="#1565c0"
                />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: selectedHazard.color },
            ]}
            onPress={() => {
              setStep("select");
              setSelectedHazard(null);
              setAnswers({});
              setResult(null);
            }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>Assess Another Hazard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: "#546e7a", marginTop: 8 },
            ]}
            onPress={handleReset}
          >
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>Back to Home Assessment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    backgroundColor: "#1565c0",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  scroll: { flex: 1 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
  },
  infoText: { flex: 1, fontSize: 13, color: "#1565c0", lineHeight: 18 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 12,
  },
  hazardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  hazardCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    elevation: 3,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  hazardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  hazardLabel: { fontSize: 13, fontWeight: "700", color: "#1a237e" },
  hazardSub: { fontSize: 11, color: "#888", marginTop: 2, marginBottom: 10 },
  startBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  startBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  progressBar: { height: 4, backgroundColor: "#e0e0e0" },
  progressFill: { height: 4, borderRadius: 2 },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  qNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qNum: { color: "#fff", fontWeight: "800", fontSize: 13 },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
    lineHeight: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e3f2fd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f8fbff",
    gap: 10,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1565c0",
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  optionText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 18 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    marginBottom: 16,
    elevation: 3,
  },
  resultTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  riskLabel: { fontSize: 22, fontWeight: "900" },
  riskHazard: { fontSize: 13, color: "#555", marginTop: 2 },
  riskScore: { fontSize: 13, color: "#777", marginTop: 4 },
  scoreBarBg: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 4,
  },
  scoreBarFill: { height: 10, borderRadius: 5 },
  scoreBarLabels: { flexDirection: "row", justifyContent: "space-between" },
  evalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
  },
  evalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  evalTitle: { fontSize: 15, fontWeight: "700", color: "#1565c0" },
  evalText: { fontSize: 14, color: "#444", lineHeight: 20 },
  tipsBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: { fontSize: 15, fontWeight: "700" },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  tipNum: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  tipText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 18 },
  actionsBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#1565c0",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    color: "#1565c0",
    fontWeight: "600",
    lineHeight: 18,
  },
});

export default AssessmentScreen;
