// Auto-seed realistic data on server startup
const localData = require('./data/localData');

// Realistic Nigerian medical scenarios
const ENCOUNTERS_DATA = [
  // Chinwe Okafor (ID: 107) - Hypertension & Diabetes
  {
    patientId: 107,
    diagnosis: 'Hypertension Stage 2, Type 2 Diabetes Mellitus',
    symptoms: 'Headache, dizziness, blurred vision, increased thirst',
    chiefComplaint: 'BP check and medication refill',
    visitType: 'Follow-up',
    notes: 'BP: 165/98 mmHg. Random blood sugar: 14.2 mmol/L. Patient reports good medication compliance. Advised lifestyle modifications.',
    medications: [
      { name: 'Amlodipine', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days' },
      { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily', duration: '30 days' }
    ]
  },

  // Ibrahim Musa (ID: 108) - Malaria & Typhoid
  {
    patientId: 108,
    diagnosis: 'Malaria (Plasmodium falciparum) with Typhoid fever',
    symptoms: 'High fever (39.5°C), severe headache, body aches, vomiting, loss of appetite',
    chiefComplaint: 'High fever for 3 days with severe body pains',
    visitType: 'Emergency',
    notes: 'Rapid diagnostic test positive for Malaria. Widal test positive (O & H antigens). Started on IV fluids. Patient admitted for observation.',
    medications: [
      { name: 'Artemether-Lumefantrine (Coartem)', dosage: '80/480mg', frequency: 'Twice daily', duration: '3 days' },
      { name: 'Ciprofloxacin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' },
      { name: 'Paracetamol', dosage: '1g', frequency: 'Three times daily as needed', duration: '5 days' }
    ]
  },

  // Adebayo Oluwaseun (ID: 109) - Peptic Ulcer Disease
  {
    patientId: 109,
    diagnosis: 'Peptic Ulcer Disease (H. pylori positive)',
    symptoms: 'Burning epigastric pain, worse at night and empty stomach, occasional nausea',
    chiefComplaint: 'Severe stomach pain for 2 weeks',
    visitType: 'New Visit',
    notes: 'H. pylori stool antigen positive. Endoscopy recommended. Started triple therapy. Advised to avoid NSAIDs and spicy foods.',
    medications: [
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Twice daily before meals', duration: '14 days' },
      { name: 'Amoxicillin', dosage: '1g', frequency: 'Twice daily', duration: '14 days' },
      { name: 'Clarithromycin', dosage: '500mg', frequency: 'Twice daily', duration: '14 days' }
    ]
  },

  // Ngozi Onyeka (ID: 115) - Asthma
  {
    patientId: 115,
    diagnosis: 'Bronchial Asthma (moderate persistent)',
    symptoms: 'Shortness of breath, wheezing, chest tightness, worse at night',
    chiefComplaint: 'Difficulty breathing especially at night',
    visitType: 'Follow-up',
    notes: 'Peak flow 65% of predicted. Asthma poorly controlled. Reviewed inhaler technique. Advised to avoid triggers (dust, smoke).',
    medications: [
      { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: '2 puffs every 4-6 hours as needed', duration: '30 days' },
      { name: 'Beclomethasone Inhaler', dosage: '200mcg', frequency: '2 puffs twice daily', duration: '30 days' },
      { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '30 days' }
    ]
  },

  // Chioma Igwe (ID: 119) - Rheumatoid Arthritis
  {
    patientId: 119,
    diagnosis: 'Rheumatoid Arthritis',
    symptoms: 'Joint pain and stiffness (hands, knees), morning stiffness >1 hour, fatigue',
    chiefComplaint: 'Joint pains and swelling for 6 months',
    visitType: 'Follow-up',
    notes: 'ESR elevated (45mm/hr). RF positive. Joint swelling noted in MCPs and PIPs bilaterally. Continue DMARDs. Refer to physiotherapy.',
    medications: [
      { name: 'Methotrexate', dosage: '15mg', frequency: 'Once weekly', duration: '30 days' },
      { name: 'Folic Acid', dosage: '5mg', frequency: 'Once daily (except MTX day)', duration: '30 days' },
      { name: 'Diclofenac', dosage: '50mg', frequency: 'Twice daily with food', duration: '14 days' },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '30 days' }
    ]
  },

  // Grace Okoro (ID: 121) - HIV/AIDS on HAART
  {
    patientId: 121,
    diagnosis: 'HIV/AIDS (on antiretroviral therapy), Oral Candidiasis',
    symptoms: 'White patches in mouth, difficulty swallowing, general body weakness',
    chiefComplaint: 'Mouth sores and difficulty eating',
    visitType: 'Follow-up',
    notes: 'CD4 count: 350 cells/mm³. Viral load undetectable. Good ART adherence. Oral thrush diagnosed. Counseling on medication adherence continued.',
    medications: [
      { name: 'Tenofovir/Lamivudine/Efavirenz (TLE)', dosage: '300/300/600mg', frequency: 'Once daily at bedtime', duration: '30 days' },
      { name: 'Fluconazole', dosage: '200mg', frequency: 'Once daily', duration: '14 days' },
      { name: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }
    ]
  }
];

function seedData() {
  console.log('🌱 Auto-seeding realistic medical data...');

  let count = 0;
  for (const encounterData of ENCOUNTERS_DATA) {
    // Create encounter
    const encounter = {
      patient: encounterData.patientId,
      patient_id: encounterData.patientId,
      diagnosis: encounterData.diagnosis,
      symptoms: encounterData.symptoms,
      chief_complaint: encounterData.chiefComplaint,
      visit_type: encounterData.visitType,
      notes: encounterData.notes,
      encounter_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    const newEncounter = localData.addEncounter(encounter);

    // Create medications
    encounterData.medications.forEach(med => {
      const medication = {
        patient: encounterData.patientId,
        patient_id: encounterData.patientId,
        encounter: newEncounter.id,
        encounter_id: newEncounter.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        prescribed_date: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      localData.addMedication(medication);
    });

    count++;
  }

  console.log(`✅ Seeded ${count} encounters with medications for Nigerian patients`);
}

module.exports = { seedData };
