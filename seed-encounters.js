const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = 'http://localhost:4000';
const TOKEN = 'mock-token-for-hackathon';

const backendClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Sample ADR reports to seed
const sampleADRs = [
  {
    patientId: 107,
    patientName: "Chinwe Okafor",
    suspectedDrug: "Amoxicillin",
    reaction: "Severe skin rash and itching",
    onset: "2024-11-18",
    severity: "Moderate",
    outcome: "Recovering",
    seriousness: "Non-serious",
    notes: "Patient developed rash 3 days after starting antibiotic. Discontinued medication.",
    reportedBy: "Dr. Adeyemi"
  },
  {
    patientId: 108,
    patientName: "Ibrahim Musa",
    suspectedDrug: "Metformin",
    reaction: "Persistent nausea and vomiting",
    onset: "2024-11-15",
    severity: "Mild",
    outcome: "Recovered",
    seriousness: "Non-serious",
    notes: "GI symptoms resolved after dose reduction.",
    reportedBy: "Dr. Sola"
  },
  {
    patientId: 115,
    patientName: "Ngozi Onyeka",
    suspectedDrug: "Lisinopril",
    reaction: "Persistent dry cough",
    onset: "2024-11-10",
    severity: "Mild",
    outcome: "Continuing",
    seriousness: "Non-serious",
    notes: "ACE inhibitor-induced cough. Considering switch to ARB.",
    reportedBy: "Dr. Williams"
  },
  {
    patientId: 119,
    patientName: "Chioma Igwe",
    suspectedDrug: "Ibuprofen",
    reaction: "Gastric upset and heartburn",
    onset: "2024-11-17",
    severity: "Moderate",
    outcome: "Recovering",
    seriousness: "Non-serious",
    notes: "Patient has history of GERD. Advised to avoid NSAIDs.",
    reportedBy: "Dr. Okoro"
  },
  {
    patientId: 121,
    patientName: "Grace Okoro",
    suspectedDrug: "Morphine",
    reaction: "Severe respiratory depression",
    onset: "2024-11-19",
    severity: "Severe",
    outcome: "Recovered",
    seriousness: "Serious",
    notes: "Patient experienced significant respiratory depression. Naloxone administered. Full recovery.",
    reportedBy: "Dr. Emergency Team"
  }
];

async function seedADRReports() {
  console.log('🌱 Seeding ADR reports...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const adr of sampleADRs) {
    try {
      const response = await backendClient.post('/api/adr', adr);
      const reportId = response.data?.report?.id || 'unknown';
      console.log(`✅ Created ADR: ${adr.patientName} - ${adr.suspectedDrug} (ID: ${reportId})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ADR for ${adr.patientName}:`, error.response?.data?.error || error.message);
      errorCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n🎉 ADR seeding complete!`);
  console.log(`✅ Successfully created: ${successCount} reports`);
  console.log(`❌ Failed: ${errorCount} reports\n`);
}

seedADRReports().catch(console.error);
