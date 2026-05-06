// src/services/api.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAdminMetrics = async () => {
  // Simulate API call
  await delay(500);
  return {
    overallOrders: 12,
    ordersToReview: 8,
    pharmaciesInKigali: 45,
    patients: 32,
  };
};

export const getWorkingPharmacies = async () => {
  await delay(600);
  return [
    {
      id: '#MD-8472',
      name: 'Kipharma',
      time: 'Oct 24, 09:15 AM',
      status: 'Pending',
      action: 'Review',
    },
    {
      id: '#MD-8471',
      name: 'Sana Pharma',
      time: 'Oct 24, 08:42 AM',
      status: 'Pending',
      action: 'Review',
    },
    {
      id: '#MD-8470',
      name: 'Viva Pharmacy',
      time: 'Oct 24, 08:30 AM',
      status: 'Reviewing',
      action: 'Continue',
    },
    {
      id: '#MD-8469',
      name: 'Sun City Medicines',
      time: 'Oct 24, 08:15 AM',
      status: 'Confirmed',
      action: 'View',
    },
    {
      id: '#MD-8468',
      name: 'Kigali Heights Pharma',
      time: 'Oct 23, 04:20 PM',
      status: 'Confirmed',
      action: 'View',
    },
    {
      id: '#MD-8467',
      name: 'Rubavu Lake Drugs',
      time: 'Oct 23, 02:10 PM',
      status: 'Pending',
      action: 'Review',
    },
    {
      id: '#MD-8466',
      name: 'Musanze Care',
      time: 'Oct 23, 11:45 AM',
      status: 'Confirmed',
      action: 'View',
    },
    {
      id: '#MD-8465',
      name: 'Huye Wellness',
      time: 'Oct 23, 09:30 AM',
      status: 'Reviewing',
      action: 'Continue',
    },
    {
      id: '#MD-8464',
      name: 'Nyagatare Central',
      time: 'Oct 22, 05:50 PM',
      status: 'Confirmed',
      action: 'View',
    },
    {
      id: '#MD-8463',
      name: 'Kayonza Pharm',
      time: 'Oct 22, 03:25 PM',
      status: 'Pending',
      action: 'Review',
    },
  ];
};

export const getPharmacistMetrics = async () => {
  await delay(500);
  return {
    newOrders: 12,
    pendingPrescriptions: 5,
    readyToShip: 8,
    lowStockItems: 2,
  };
};

export const getPharmacistOrders = async () => {
  await delay(600);
  return [
    {
      id: '#2041',
      patient: 'Jean Mutoni',
      medication: 'Amoxicillin 500mg ×2',
      time: '2 min ago',
      status: 'New',
      action: 'Confirm',
    },
    {
      id: '#2040',
      patient: 'Eric Mugisha',
      medication: 'Metformin 850mg ×3',
      time: '18 min ago',
      status: 'Undergo',
      action: 'View',
    },
    {
      id: '#2039',
      patient: 'Alice Uwase',
      medication: 'Insulin Glargine ×1',
      time: '45 min ago',
      status: 'Processing',
      action: 'Complete',
    },
    {
      id: '#2038',
      patient: 'Claude Niyonsaba',
      medication: 'Paracetamol 1g ×5',
      time: '1 hr ago',
      status: 'Completed',
      action: 'Done',
    },
    {
      id: '#2037',
      patient: 'Marie Ingabire',
      medication: 'Omeprazole 20mg ×1',
      time: '2 hr ago',
      status: 'Rejected',
      action: 'Invalid Rx',
    },
  ];
};
