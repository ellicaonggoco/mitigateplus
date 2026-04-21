const mongoose = require("mongoose");
const dotenv = require("dotenv");
const GoBagItem = require("./models/GoBagItem");

dotenv.config();

const defaultItems = [
  // 💧 Water & Food
  {
    name: "Drinking Water",
    category: "food",
    description: "At least 3 liters per person per day",
    whyImportant:
      "Dehydration is life-threatening during disasters. Clean water may be unavailable for days.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Non-perishable Food",
    category: "food",
    description: "Canned goods, biscuits, energy bars (3-day supply)",
    whyImportant:
      "Food supply chains break down during disasters. Ready-to-eat food ensures you have energy to evacuate safely.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Manual Can Opener",
    category: "food",
    description: "Non-electric can opener for canned food",
    whyImportant:
      "Useless to have canned food without a way to open it during power outages.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  // 🏥 Medical
  {
    name: "First Aid Kit",
    category: "medical",
    description: "Bandages, antiseptic, gauze, adhesive tape, scissors, gloves",
    whyImportant:
      "Injuries are common during disasters. A first aid kit can prevent infections and save lives before medical help arrives.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Personal Medications",
    category: "medical",
    description: "7-day supply of maintenance medicines",
    whyImportant:
      "Medical facilities may be inaccessible. Running out of critical medications during a disaster can be fatal.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Face Masks",
    category: "medical",
    description: "N95 or surgical masks (at least 5 per person)",
    whyImportant:
      "Smoke, dust, and air-borne contaminants are common during disasters like fires and structural collapses.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Alcohol / Hand Sanitizer",
    category: "medical",
    description: "70% isopropyl alcohol or hand sanitizer (250ml)",
    whyImportant:
      "Prevents spread of disease when access to clean water for handwashing is limited.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  // 📄 Documents
  {
    name: "Important Documents",
    category: "documents",
    description:
      "Birth certificates, IDs, insurance, land titles in waterproof folder",
    whyImportant:
      "Documents are needed for government assistance, insurance claims, and identity verification after disasters.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Emergency Contact List",
    category: "documents",
    description: "Written list of family, neighbors, MDRRMO, BFP contacts",
    whyImportant:
      "Phone batteries die. A written contact list ensures you can reach help even without a charged phone.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Cash (Small Bills)",
    category: "documents",
    description: "At least ₱2,000 in small denominations",
    whyImportant:
      "ATMs and card readers may be down during power outages. Cash is essential for emergency purchases.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  // 🔧 Tools & Safety
  {
    name: "Flashlight with Extra Batteries",
    category: "tools",
    description: "LED flashlight with 2 sets of spare batteries",
    whyImportant:
      "Power outages are common during disasters. Light is essential for safe navigation and signaling for help.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Battery-powered or Hand-crank Radio",
    category: "tools",
    description: "AM/FM radio for emergency broadcasts",
    whyImportant:
      "Official updates from PAGASA, NDRRMC, and LGU are broadcast via radio when internet and TV are down.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Whistle",
    category: "tools",
    description: "Loud safety whistle for signaling",
    whyImportant:
      "If trapped under debris, a whistle can be heard much farther than your voice and uses less energy.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Rope (10 meters)",
    category: "tools",
    description: "Strong nylon rope for climbing, securing items, or rescue",
    whyImportant:
      "Useful for flood evacuation, securing go bag to body, or assisting others during rescue.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Waterproof Bag / Dry Bag",
    category: "tools",
    description: "Large waterproof bag to protect go bag contents",
    whyImportant:
      "Flood water can destroy documents and electronics. Waterproof protection preserves critical items.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Multi-tool or Swiss Army Knife",
    category: "tools",
    description: "Compact multi-tool with knife, pliers, screwdriver",
    whyImportant:
      "Versatile tool for cutting, prying, or repairing during emergencies when specialized tools aren't available.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Duct Tape",
    category: "tools",
    description: "Heavy-duty duct tape (1 roll)",
    whyImportant:
      "Can seal windows against storm, patch leaks, create splints, or secure damaged structures temporarily.",
    forRiskLevel: ["moderate", "high"],
  },
  // 👕 Clothing & Shelter
  {
    name: "Change of Clothes (3 days)",
    category: "tools",
    description: "Comfortable, weather-appropriate clothing per person",
    whyImportant:
      "Wet clothes can cause hypothermia. Clean clothing prevents skin infections in evacuation centers.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Rain Poncho / Waterproof Jacket",
    category: "tools",
    description: "Lightweight waterproof rain gear",
    whyImportant:
      "Staying dry during typhoons and floods is critical to prevent hypothermia and maintain body temperature.",
    forRiskLevel: ["moderate", "high"],
  },
  {
    name: "Blanket or Emergency Mylar Blanket",
    category: "tools",
    description: "Thermal blanket for warmth",
    whyImportant:
      "Evacuation centers can be cold. Mylar blankets are lightweight and retain 90% of body heat.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  // 📱 Communication
  {
    name: "Fully Charged Power Bank",
    category: "tools",
    description: "At least 10,000mAh power bank, fully charged before disaster",
    whyImportant:
      "Keeping your phone charged means staying connected with family and accessing emergency alerts.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  {
    name: "Spare Phone Charger",
    category: "tools",
    description: "Extra charging cable and adapter",
    whyImportant:
      "Lost or broken chargers during evacuation leave you unable to communicate or access digital documents.",
    forRiskLevel: ["low", "moderate", "high"],
  },
  // 🔦 High Risk Extras
  {
    name: "Life Vest / Floatation Device",
    category: "tools",
    description: "Personal floatation device or life jacket",
    whyImportant:
      "Essential for flood-prone areas. Prevents drowning during flash floods or deep floodwater evacuation.",
    forRiskLevel: ["high"],
  },
  {
    name: "Fire Extinguisher (Small)",
    category: "tools",
    description: "Compact ABC dry chemical fire extinguisher",
    whyImportant:
      "Small fires can be extinguished before becoming catastrophic. Required for high fire-risk households.",
    forRiskLevel: ["high"],
  },
  {
    name: "N95 Respirator Masks",
    category: "medical",
    description: "Heavy-duty N95 masks (box of 10)",
    whyImportant:
      "Critical for high-risk areas with fire, volcanic ash, or heavy particulate matter in the air.",
    forRiskLevel: ["high"],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await GoBagItem.countDocuments();
    if (existing > 0) {
      console.log(
        `⚠️  ${existing} items already exist. Clearing and reseeding...`,
      );
      await GoBagItem.deleteMany({});
    }

    await GoBagItem.insertMany(defaultItems);
    console.log(`✅ Successfully seeded ${defaultItems.length} Go Bag items!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
