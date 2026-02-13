// Mock patient data with appointment history and services

const services = [
  { code: 'ADJ-FULL', name: 'Full Spine Adjustment', price: 75 },
  { code: 'ADJ-CERV', name: 'Cervical Adjustment', price: 55 },
  { code: 'ADJ-LUMB', name: 'Lumbar Adjustment', price: 55 },
  { code: 'MASS-30', name: 'Therapeutic Massage (30 min)', price: 50 },
  { code: 'MASS-60', name: 'Therapeutic Massage (60 min)', price: 90 },
  { code: 'TENS', name: 'TENS Therapy', price: 25 },
  { code: 'ULTRA', name: 'Ultrasound Therapy', price: 30 },
  { code: 'XRAY', name: 'X-Ray Imaging', price: 150 },
  { code: 'CONSULT', name: 'Initial Consultation', price: 100 },
  { code: 'FOLLOWUP', name: 'Follow-up Visit', price: 45 },
  { code: 'DECOM', name: 'Spinal Decompression', price: 85 },
  { code: 'ACUP', name: 'Acupuncture Session', price: 70 },
]

const generateNote = () => {
  const notes = [
    'Patient reports improvement in range of motion.',
    'Adjusted T4-T7. Patient tolerated well.',
    'Continued maintenance care. No new complaints.',
    'Patient reports 50% reduction in pain.',
    'Applied ice therapy post-adjustment.',
    'Recommended home exercises for core strengthening.',
    'Patient to return in 2 weeks for follow-up.',
    'Muscle tension noted in trapezius region.',
    'Good progress. Reducing visit frequency.',
    'Discussed ergonomic workplace modifications.'
  ]
  return notes[Math.floor(Math.random() * notes.length)]
}

// Generate appointments centered around Feb 2026
const generateAppointments = (patientId, startDate, count) => {
  const appointments = []
  const today = new Date('2026-02-12')

  // Start from the patient's start date
  let date = new Date(startDate)

  for (let i = 0; i < count; i++) {
    // Determine status based on date relative to today
    const aptDate = new Date(date)
    let status
    if (aptDate < today) {
      status = Math.random() > 0.1 ? 'completed' : 'cancelled'
    } else {
      status = Math.random() > 0.15 ? 'scheduled' : 'cancelled'
    }

    const hour = 8 + Math.floor(Math.random() * 9) // 8am to 5pm
    const minute = Math.random() > 0.5 ? 0 : 30

    const appointmentServices = []
    const numServices = 1 + Math.floor(Math.random() * 3)
    const shuffled = [...services].sort(() => 0.5 - Math.random())
    for (let j = 0; j < numServices; j++) {
      appointmentServices.push(shuffled[j])
    }

    appointments.push({
      id: `${patientId}-apt-${i + 1}`,
      patientId,
      date: date.toISOString().split('T')[0],
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      status,
      services: appointmentServices,
      notes: status === 'completed' ? generateNote() : '',
      provider: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'][Math.floor(Math.random() * 3)]
    })

    // Add 5-14 days for next appointment
    date.setDate(date.getDate() + 5 + Math.floor(Math.random() * 10))
  }

  return appointments
}

export const mockPatients = [
  {
    id: 'P001',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    emergencyContact: 'Sarah Anderson',
    emergencyPhone: '(555) 123-4568',
    condition: 'Lower Back Pain',
    insuranceProvider: 'Blue Cross',
    insuranceId: 'BC-789456123',
    startDate: '2025-11-10'
  },
  {
    id: 'P002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1990-07-22',
    address: '456 Elm Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    emergencyContact: 'Carlos Garcia',
    emergencyPhone: '(555) 234-5679',
    condition: 'Neck Pain',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-456789123',
    startDate: '2025-12-05'
  },
  {
    id: 'P003',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1978-11-30',
    address: '789 Maple Drive',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    emergencyContact: 'Linda Johnson',
    emergencyPhone: '(555) 345-6780',
    condition: 'Sciatica',
    insuranceProvider: 'United Health',
    insuranceId: 'UH-321654987',
    startDate: '2025-10-20'
  },
  {
    id: 'P004',
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: '1995-04-18',
    address: '321 Pine Lane',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    emergencyContact: 'Michael Williams',
    emergencyPhone: '(555) 456-7891',
    condition: 'Sports Injury',
    insuranceProvider: 'Cigna',
    insuranceId: 'CIG-147258369',
    startDate: '2026-01-05'
  },
  {
    id: 'P005',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '(555) 567-8901',
    dateOfBirth: '1982-09-05',
    address: '654 Cedar Court',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62705',
    emergencyContact: 'Jennifer Brown',
    emergencyPhone: '(555) 567-8902',
    condition: 'Herniated Disc',
    insuranceProvider: 'Blue Cross',
    insuranceId: 'BC-963852741',
    startDate: '2025-09-15'
  },
  {
    id: 'P006',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@email.com',
    phone: '(555) 678-9012',
    dateOfBirth: '1988-12-12',
    address: '987 Birch Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62706',
    emergencyContact: 'Tom Davis',
    emergencyPhone: '(555) 678-9013',
    condition: 'Headaches/Migraines',
    insuranceProvider: 'Humana',
    insuranceId: 'HUM-159753486',
    startDate: '2025-12-25'
  },
  {
    id: 'P007',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@email.com',
    phone: '(555) 789-0123',
    dateOfBirth: '1975-06-28',
    address: '147 Walnut Way',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62707',
    emergencyContact: 'Nancy Miller',
    emergencyPhone: '(555) 789-0124',
    condition: 'Whiplash',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-753951852',
    startDate: '2026-01-18'
  },
  {
    id: 'P008',
    firstName: 'Jennifer',
    lastName: 'Wilson',
    email: 'jennifer.wilson@email.com',
    phone: '(555) 890-1234',
    dateOfBirth: '1992-02-14',
    address: '258 Spruce Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62708',
    emergencyContact: 'Mark Wilson',
    emergencyPhone: '(555) 890-1235',
    condition: 'Shoulder Pain',
    insuranceProvider: 'United Health',
    insuranceId: 'UH-852456789',
    startDate: '2025-11-10'
  },
  {
    id: 'P009',
    firstName: 'Christopher',
    lastName: 'Moore',
    email: 'chris.moore@email.com',
    phone: '(555) 901-2345',
    dateOfBirth: '1980-08-21',
    address: '369 Ash Boulevard',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62709',
    emergencyContact: 'Lisa Moore',
    emergencyPhone: '(555) 901-2346',
    condition: 'Lower Back Pain',
    insuranceProvider: 'Cigna',
    insuranceId: 'CIG-951753842',
    startDate: '2025-10-05'
  },
  {
    id: 'P010',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.taylor@email.com',
    phone: '(555) 012-3456',
    dateOfBirth: '1987-01-08',
    address: '741 Hickory Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62710',
    emergencyContact: 'Brian Taylor',
    emergencyPhone: '(555) 012-3457',
    condition: 'Scoliosis',
    insuranceProvider: 'Blue Cross',
    insuranceId: 'BC-357159486',
    startDate: '2025-09-18'
  },
  {
    id: 'P011',
    firstName: 'Daniel',
    lastName: 'Thomas',
    email: 'daniel.thomas@email.com',
    phone: '(555) 111-2222',
    dateOfBirth: '1993-05-25',
    address: '852 Poplar Circle',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62711',
    emergencyContact: 'Rachel Thomas',
    emergencyPhone: '(555) 111-2223',
    condition: 'Hip Pain',
    insuranceProvider: 'Humana',
    insuranceId: 'HUM-258369147',
    startDate: '2025-12-08'
  },
  {
    id: 'P012',
    firstName: 'Jessica',
    lastName: 'Jackson',
    email: 'jessica.jackson@email.com',
    phone: '(555) 222-3333',
    dateOfBirth: '1984-10-03',
    address: '963 Willow Lane',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62712',
    emergencyContact: 'Kevin Jackson',
    emergencyPhone: '(555) 222-3334',
    condition: 'Carpal Tunnel',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-147963258',
    startDate: '2026-01-28'
  },
  {
    id: 'P013',
    firstName: 'Matthew',
    lastName: 'White',
    email: 'matthew.white@email.com',
    phone: '(555) 333-4444',
    dateOfBirth: '1979-07-17',
    address: '159 Redwood Drive',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62713',
    emergencyContact: 'Susan White',
    emergencyPhone: '(555) 333-4445',
    condition: 'Neck Pain',
    insuranceProvider: 'United Health',
    insuranceId: 'UH-369258147',
    startDate: '2025-11-12'
  },
  {
    id: 'P014',
    firstName: 'Ashley',
    lastName: 'Harris',
    email: 'ashley.harris@email.com',
    phone: '(555) 444-5555',
    dateOfBirth: '1991-03-29',
    address: '753 Sycamore Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62714',
    emergencyContact: 'Ryan Harris',
    emergencyPhone: '(555) 444-5556',
    condition: 'TMJ Disorder',
    insuranceProvider: 'Cigna',
    insuranceId: 'CIG-258147369',
    startDate: '2026-02-01'
  },
  {
    id: 'P015',
    firstName: 'Andrew',
    lastName: 'Martin',
    email: 'andrew.martin@email.com',
    phone: '(555) 555-6666',
    dateOfBirth: '1986-11-11',
    address: '486 Chestnut Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62715',
    emergencyContact: 'Michelle Martin',
    emergencyPhone: '(555) 555-6667',
    condition: 'Sciatica',
    insuranceProvider: 'Blue Cross',
    insuranceId: 'BC-159357486',
    startDate: '2025-12-22'
  },
  {
    id: 'P016',
    firstName: 'Stephanie',
    lastName: 'Thompson',
    email: 'stephanie.thompson@email.com',
    phone: '(555) 666-7777',
    dateOfBirth: '1994-08-07',
    address: '264 Magnolia Court',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62716',
    emergencyContact: 'Jason Thompson',
    emergencyPhone: '(555) 666-7778',
    condition: 'Sports Injury',
    insuranceProvider: 'Humana',
    insuranceId: 'HUM-486159753',
    startDate: '2025-12-30'
  },
  {
    id: 'P017',
    firstName: 'Joshua',
    lastName: 'Garcia',
    email: 'joshua.garcia@email.com',
    phone: '(555) 777-8888',
    dateOfBirth: '1983-04-02',
    address: '175 Laurel Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62717',
    emergencyContact: 'Maria Garcia',
    emergencyPhone: '(555) 777-8889',
    condition: 'Lower Back Pain',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-753486159',
    startDate: '2025-10-28'
  },
  {
    id: 'P018',
    firstName: 'Nicole',
    lastName: 'Martinez',
    email: 'nicole.martinez@email.com',
    phone: '(555) 888-9999',
    dateOfBirth: '1989-12-25',
    address: '398 Dogwood Lane',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62718',
    emergencyContact: 'Carlos Martinez',
    emergencyPhone: '(555) 888-9990',
    condition: 'Herniated Disc',
    insuranceProvider: 'United Health',
    insuranceId: 'UH-159486753',
    startDate: '2025-09-05'
  },
  {
    id: 'P019',
    firstName: 'Kevin',
    lastName: 'Robinson',
    email: 'kevin.robinson@email.com',
    phone: '(555) 999-0000',
    dateOfBirth: '1977-06-19',
    address: '627 Juniper Way',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62719',
    emergencyContact: 'Patricia Robinson',
    emergencyPhone: '(555) 999-0001',
    condition: 'Whiplash',
    insuranceProvider: 'Cigna',
    insuranceId: 'CIG-486753159',
    startDate: '2026-01-12'
  },
  {
    id: 'P020',
    firstName: 'Lauren',
    lastName: 'Clark',
    email: 'lauren.clark@email.com',
    phone: '(555) 000-1111',
    dateOfBirth: '1996-09-14',
    address: '534 Cypress Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62720',
    emergencyContact: 'Steven Clark',
    emergencyPhone: '(555) 000-1112',
    condition: 'Shoulder Pain',
    insuranceProvider: 'Blue Cross',
    insuranceId: 'BC-753159486',
    startDate: '2026-02-05'
  }
]

// Generate appointments for each patient
export const mockAppointments = mockPatients.flatMap(patient => {
  const appointmentCount = 4 + Math.floor(Math.random() * 6) // 4-9 appointments each
  return generateAppointments(patient.id, patient.startDate, appointmentCount)
})

// Helper to get patient by ID
export const getPatientById = (id) => mockPatients.find(p => p.id === id)

// Helper to get appointments by patient ID
export const getAppointmentsByPatientId = (patientId) =>
  mockAppointments.filter(a => a.patientId === patientId).sort((a, b) =>
    new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time)
  )

// Helper to get appointments by date
export const getAppointmentsByDate = (date) =>
  mockAppointments.filter(a => a.date === date)

// Helper to get all services for a patient
export const getServicesByPatientId = (patientId) => {
  const appointments = getAppointmentsByPatientId(patientId)
  const serviceMap = new Map()

  appointments.forEach(apt => {
    if (apt.status === 'completed') {
      apt.services.forEach(service => {
        const existing = serviceMap.get(service.code)
        if (existing) {
          existing.count++
          existing.totalSpent += service.price
        } else {
          serviceMap.set(service.code, {
            ...service,
            count: 1,
            totalSpent: service.price
          })
        }
      })
    }
  })

  return Array.from(serviceMap.values())
}

export { services }
