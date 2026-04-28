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
      name: 'kipharma',
      time: 'Oct 24, 09:15 AM',
      status: 'Pending',
      action: 'Review',
    },
    {
      id: '#MD-8471',
      name: 'sana',
      time: 'Oct 24, 08:42 AM',
      status: 'Pending',
      action: 'Review',
    },
    {
      id: '#MD-8470',
      name: 'viva pharmacy',
      time: 'Oct 24, 08:30 AM',
      status: 'Reviewing',
      action: 'Continue',
    },
    {
      id: '#MD-8469',
      name: 'Maria Garcia',
      time: 'Oct 24, 08:15 AM',
      status: 'Confirmed',
      action: 'View',
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
