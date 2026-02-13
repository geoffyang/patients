import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getPatientById,
  getAppointmentsByPatientId,
  getServicesByPatientId,
  services
} from '../data/mockPatients'
import './PatientView.css'

function PatientView() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patientServices, setPatientServices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('appointments')

  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '09:00',
    provider: 'Dr. Smith',
    services: [],
    notes: ''
  })

  useEffect(() => {
    const p = getPatientById(patientId)
    if (p) {
      setPatient(p)
      setAppointments(getAppointmentsByPatientId(patientId))
      setPatientServices(getServicesByPatientId(patientId))
    }
  }, [patientId])

  const handleAddAppointment = (e) => {
    e.preventDefault()
    const newApt = {
      id: `${patientId}-apt-new-${Date.now()}`,
      patientId,
      date: newAppointment.date,
      time: newAppointment.time,
      status: 'scheduled',
      services: newAppointment.services.map(code =>
        services.find(s => s.code === code)
      ),
      notes: newAppointment.notes,
      provider: newAppointment.provider
    }
    setAppointments([newApt, ...appointments])
    setShowModal(false)
    setNewAppointment({
      date: '',
      time: '09:00',
      provider: 'Dr. Smith',
      services: [],
      notes: ''
    })
  }

  const handleServiceToggle = (code) => {
    setNewAppointment(prev => ({
      ...prev,
      services: prev.services.includes(code)
        ? prev.services.filter(s => s !== code)
        : [...prev.services, code]
    }))
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const calculateAge = (dob) => {
    const today = new Date()
    const birth = new Date(dob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge-completed',
      scheduled: 'badge-scheduled',
      cancelled: 'badge-cancelled'
    }
    return badges[status] || ''
  }

  if (!patient) {
    return (
      <div className="patient-view">
        <div className="loading">Patient not found</div>
      </div>
    )
  }

  const totalSpent = patientServices.reduce((sum, s) => sum + s.totalSpent, 0)
  const completedAppointments = appointments.filter(a => a.status === 'completed').length
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length

  return (
    <div className="patient-view">
      {/* Header */}
      <header className="pv-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-actions">
          <button className="btn-calendar" onClick={() => navigate('/calendar')}>
            📅 Calendar
          </button>
          <button className="btn-add-apt" onClick={() => setShowModal(true)}>
            + New Appointment
          </button>
        </div>
      </header>

      {/* Patient Info Card */}
      <div className="patient-card">
        <div className="patient-avatar">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div className="patient-main-info">
          <h1>{patient.firstName} {patient.lastName}</h1>
          <p className="patient-condition">{patient.condition}</p>
          <div className="patient-meta">
            <span>📧 {patient.email}</span>
            <span>📞 {patient.phone}</span>
            <span>🎂 {calculateAge(patient.dateOfBirth)} years old</span>
          </div>
        </div>
        <div className="patient-stats">
          <div className="stat">
            <span className="stat-value">{completedAppointments}</span>
            <span className="stat-label">Visits</span>
          </div>
          <div className="stat">
            <span className="stat-value">{upcomingAppointments}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat">
            <span className="stat-value">${totalSpent.toLocaleString()}</span>
            <span className="stat-label">Total Billed</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="patient-details">
        <div className="details-grid">
          <div className="detail-item">
            <label>Address</label>
            <p>{patient.address}, {patient.city}, {patient.state} {patient.zipCode}</p>
          </div>
          <div className="detail-item">
            <label>Date of Birth</label>
            <p>{formatDate(patient.dateOfBirth)}</p>
          </div>
          <div className="detail-item">
            <label>Emergency Contact</label>
            <p>{patient.emergencyContact} - {patient.emergencyPhone}</p>
          </div>
          <div className="detail-item">
            <label>Insurance</label>
            <p>{patient.insuranceProvider} ({patient.insuranceId})</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointment History
        </button>
        <button
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services Rendered
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'appointments' && (
          <div className="appointments-list">
            {appointments.length === 0 ? (
              <p className="no-data">No appointments found</p>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className={`appointment-card ${apt.status}`}>
                  <div className="apt-date-time">
                    <div className="apt-date">{formatDate(apt.date)}</div>
                    <div className="apt-time">{formatTime(apt.time)}</div>
                  </div>
                  <div className="apt-details">
                    <div className="apt-provider">{apt.provider}</div>
                    <div className="apt-services">
                      {apt.services.map(s => (
                        <span key={s.code} className="service-tag">{s.name}</span>
                      ))}
                    </div>
                    {apt.notes && <div className="apt-notes">{apt.notes}</div>}
                  </div>
                  <div className="apt-status">
                    <span className={`badge ${getStatusBadge(apt.status)}`}>
                      {apt.status}
                    </span>
                    <div className="apt-total">
                      ${apt.services.reduce((sum, s) => sum + s.price, 0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-list">
            {patientServices.length === 0 ? (
              <p className="no-data">No services rendered yet</p>
            ) : (
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Code</th>
                    <th>Unit Price</th>
                    <th>Times Used</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {patientServices.map(service => (
                    <tr key={service.code}>
                      <td>{service.name}</td>
                      <td><code>{service.code}</code></td>
                      <td>${service.price}</td>
                      <td>{service.count}</td>
                      <td><strong>${service.totalSpent}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4">Total</td>
                    <td><strong>${totalSpent}</strong></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Appointment</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAppointment}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={e => setNewAppointment({...newAppointment, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <select
                      value={newAppointment.time}
                      onChange={e => setNewAppointment({...newAppointment, time: e.target.value})}
                    >
                      {Array.from({length: 18}, (_, i) => {
                        const hour = 8 + Math.floor(i / 2)
                        const min = i % 2 === 0 ? '00' : '30'
                        const time = `${hour.toString().padStart(2, '0')}:${min}`
                        return <option key={time} value={time}>{formatTime(time)}</option>
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Provider *</label>
                  <select
                    value={newAppointment.provider}
                    onChange={e => setNewAppointment({...newAppointment, provider: e.target.value})}
                  >
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Johnson">Dr. Johnson</option>
                    <option value="Dr. Williams">Dr. Williams</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Services</label>
                  <div className="services-checkbox-grid">
                    {services.map(service => (
                      <label key={service.code} className="service-checkbox">
                        <input
                          type="checkbox"
                          checked={newAppointment.services.includes(service.code)}
                          onChange={() => handleServiceToggle(service.code)}
                        />
                        <span>{service.name} (${service.price})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})}
                    rows="3"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientView
