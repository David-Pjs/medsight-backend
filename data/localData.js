// Shared in-memory data storage for encounters and medications
// This allows us to add rich clinical data beyond what DORRA stores

let localEncounters = [];
let encounterIdCounter = 1000; // Start from 1000 to avoid conflicts

let localMedications = [];
let medicationIdCounter = 2000; // Start from 2000 to avoid conflicts

module.exports = {
  // Encounters
  getEncounters: () => localEncounters,
  addEncounter: (encounter) => {
    encounter.id = encounterIdCounter++;
    encounter.created_at = encounter.created_at || new Date().toISOString();
    localEncounters.push(encounter);
    return encounter;
  },
  getEncounterById: (id) => localEncounters.find(e => e.id == id),
  getEncountersByPatient: (patientId) => localEncounters.filter(e => e.patient == patientId || e.patient_id == patientId),

  // Medications
  getMedications: () => localMedications,
  addMedication: (medication) => {
    medication.id = medicationIdCounter++;
    medication.created_at = medication.created_at || new Date().toISOString();
    localMedications.push(medication);
    return medication;
  },
  getMedicationById: (id) => localMedications.find(m => m.id == id),
  getMedicationsByPatient: (patientId) => localMedications.filter(m => m.patient == patientId || m.patient_id == patientId),

  // Clear all (for testing)
  clearAll: () => {
    localEncounters = [];
    localMedications = [];
  }
};
