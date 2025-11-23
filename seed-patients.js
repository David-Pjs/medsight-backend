const axios = require('axios');
require('dotenv').config();

const DORRA_API_BASE_URL = process.env.DORRA_API_BASE_URL || 'https://hackathon-api.aheadafrica.org';
const DORRA_API_TOKEN = process.env.DORRA_API_TOKEN;

const dorraClient = axios.create({
  baseURL: DORRA_API_BASE_URL,
  headers: {
    Authorization: `Token ${DORRA_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const nigerianPatients = [
  {
    first_name: "Chinwe",
    last_name: "Okafor",
    gender: "Female",
    age: "34",
    phone_number: "+234 803 456 7890",
    address: "15 Admiralty Way, Lekki, Lagos",
    allergies: ["Penicillin"]
  },
  {
    first_name: "Ibrahim",
    last_name: "Musa",
    gender: "Male",
    age: "45",
    phone_number: "+234 805 123 4567",
    address: "23 Ahmadu Bello Way, Victoria Island, Lagos",
    allergies: []
  },
  {
    first_name: "Amara",
    last_name: "Nwosu",
    gender: "Female",
    age: "28",
    phone_number: "+234 807 234 5678",
    address: "8 Allen Avenue, Ikeja, Lagos",
    allergies: ["Sulfa drugs"]
  },
  {
    first_name: "Oluwaseun",
    last_name: "Adeyemi",
    gender: "Male",
    age: "52",
    phone_number: "+234 809 345 6789",
    address: "45 Ikorodu Road, Maryland, Lagos",
    allergies: []
  },
  {
    first_name: "Fatima",
    last_name: "Bello",
    gender: "Female",
    age: "31",
    phone_number: "+234 810 456 7890",
    address: "12 Wuse Zone 5, Abuja",
    allergies: ["Aspirin"]
  },
  {
    first_name: "Chidi",
    last_name: "Okonkwo",
    gender: "Male",
    age: "41",
    phone_number: "+234 812 567 8901",
    address: "67 Herbert Macaulay Way, Yaba, Lagos",
    allergies: []
  },
  {
    first_name: "Blessing",
    last_name: "Eze",
    gender: "Female",
    age: "26",
    phone_number: "+234 813 678 9012",
    address: "34 Awolowo Road, Ikoyi, Lagos",
    allergies: ["Latex"]
  },
  {
    first_name: "Yusuf",
    last_name: "Abdullahi",
    gender: "Male",
    age: "38",
    phone_number: "+234 815 789 0123",
    address: "90 Independence Avenue, Kaduna",
    allergies: []
  },
  {
    first_name: "Ngozi",
    last_name: "Onyeka",
    gender: "Female",
    age: "47",
    phone_number: "+234 816 890 1234",
    address: "22 Queens Drive, Ikoyi, Lagos",
    allergies: ["Codeine"]
  },
  {
    first_name: "Tunde",
    last_name: "Williams",
    gender: "Male",
    age: "55",
    phone_number: "+234 817 901 2345",
    address: "5 Glover Road, Ikoyi, Lagos",
    allergies: []
  },
  {
    first_name: "Adaeze",
    last_name: "Okoli",
    gender: "Female",
    age: "29",
    phone_number: "+234 818 012 3456",
    address: "18 Mobolaji Bank Anthony Way, Ikeja, Lagos",
    allergies: ["Iodine"]
  },
  {
    first_name: "Mohammed",
    last_name: "Abubakar",
    gender: "Male",
    age: "43",
    phone_number: "+234 819 123 4567",
    address: "76 Airport Road, Kano",
    allergies: []
  },
  {
    first_name: "Chioma",
    last_name: "Igwe",
    gender: "Female",
    age: "33",
    phone_number: "+234 820 234 5678",
    address: "11 Adeola Odeku Street, Victoria Island, Lagos",
    allergies: ["Peanuts", "Shellfish"]
  },
  {
    first_name: "Akin",
    last_name: "Oladele",
    gender: "Male",
    age: "49",
    phone_number: "+234 821 345 6789",
    address: "39 Bourdillon Road, Ikoyi, Lagos",
    allergies: []
  },
  {
    first_name: "Grace",
    last_name: "Okoro",
    gender: "Female",
    age: "36",
    phone_number: "+234 822 456 7890",
    address: "14 Akin Adesola Street, Victoria Island, Lagos",
    allergies: ["Morphine"]
  }
];

async function seedPatients() {
  console.log('🌱 Starting to seed Nigerian patients...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const patient of nigerianPatients) {
    try {
      const response = await dorraClient.post('/v1/patients/create', patient);
      console.log(`✅ Created: ${patient.first_name} ${patient.last_name} (ID: ${response.data.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${patient.first_name} ${patient.last_name}:`, error.response?.data || error.message);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Successfully created: ${successCount} patients`);
  console.log(`❌ Failed: ${errorCount} patients`);
}

seedPatients().catch(console.error);
