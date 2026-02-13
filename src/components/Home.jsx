import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPatients, getAppointmentsByPatientId } from '../data/mockPatients'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const filteredPatients = mockPatients
    .filter(patient => {
      const searchLower = searchTerm.toLowerCase()
      return (
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.condition.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
      } else if (sortBy === 'recent') {
        const aAppts = getAppointmentsByPatientId(a.id)
        const bAppts = getAppointmentsByPatientId(b.id)
        const aDate = aAppts[0]?.date || '1900-01-01'
        const bDate = bAppts[0]?.date || '1900-01-01'
        return bDate.localeCompare(aDate)
      } else if (sortBy === 'condition') {
        return a.condition.localeCompare(b.condition)
      }
      return 0
    })

  const getUpcomingAppointment = (patientId) => {
    const appointments = getAppointmentsByPatientId(patientId)
    const upcoming = appointments.find(a => a.status === 'scheduled')
    return upcoming
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <h1>⚕️ Spine & Wellness</h1>
          <p>Patient Management System</p>
        </div>
        <div className="header-right">
          <button className="btn-calendar" onClick={() => navigate('/calendar')}>
            📅 Calendar
          </button>
          <button className="btn-new-patient" onClick={() => navigate('/intake')}>
            + New Patient
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{mockPatients.length}</span>
          <span className="stat-label">Total Patients</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {mockPatients.filter(p => {
              const apt = getUpcomingAppointment(p.id)
              return apt !== undefined
            }).length}
          </span>
          <span className="stat-label">Upcoming Appointments</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">3</span>
          <span className="stat-label">Providers</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search patients by name, email, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent</option>
          <option value="condition">Sort by Condition</option>
        </select>
      </div>

      {/* Patient List */}
      <div className="patient-list">
        <div className="list-header">
          <span className="col-name">Patient</span>
          <span className="col-condition">Condition</span>
          <span className="col-contact">Contact</span>
          <span className="col-next">Next Appointment</span>
          <span className="col-actions">Actions</span>
        </div>
        {filteredPatients.map(patient => {
          const upcoming = getUpcomingAppointment(patient.id)
          return (
            <div
              key={patient.id}
              className="patient-row"
              onClick={() => navigate(`/patient/${patient.id}`)}
            >
              <div className="col-name">
                <div className="patient-avatar-sm">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                  <div className="patient-name">{patient.firstName} {patient.lastName}</div>
                  <div className="patient-id">{patient.id}</div>
                </div>
              </div>
              <div className="col-condition">
                <span className="condition-tag">{patient.condition}</span>
              </div>
              <div className="col-contact">
                <div>{patient.phone}</div>
                <div className="email">{patient.email}</div>
              </div>
              <div className="col-next">
                {upcoming ? (
                  <span className="upcoming-badge">
                    {formatDate(upcoming.date)} at {upcoming.time}
                  </span>
                ) : (
                  <span className="no-appointment">No upcoming</span>
                )}
              </div>
              <div className="col-actions">
                <button
                  className="btn-view"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/patient/${patient.id}`)
                  }}
                >
                  View
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="no-results">
          <p>No patients found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <h3>Quick Actions</h3>
        <div className="links-grid">
          <button onClick={() => navigate('/intake')}>
            📝 New Patient Intake
          </button>
          <button onClick={() => navigate('/calendar')}>
            📅 View Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
