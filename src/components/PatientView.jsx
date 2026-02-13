import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getPatientById,
  getAppointmentsByPatientId,
  getServicesByPatientId,
  services
} from '../data/mockPatients'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from './ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog'
import './PatientView.css'

function PatientView() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patientServices, setPatientServices] = useState([])
  const [showModal, setShowModal] = useState(false)

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

  const getStatusBadgeVariant = (status) => {
    const variants = {
      completed: 'success',
      scheduled: 'info',
      cancelled: 'destructive',
      missed: 'warning'
    }
    return variants[status] || 'secondary'
  }

  if (!patient) {
    return (
      <div className="patient-view">
        <div className="text-center py-16 text-gray-400">Patient not found</div>
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
        <Button variant="outline" onClick={() => navigate(-1)}>
          &larr; Back
        </Button>
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
          <Button onClick={() => setShowModal(true)}>
            + New Appointment
          </Button>
        </div>
      </header>

      {/* Patient Info Card */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="patient-card-inner">
            <div className="patient-avatar">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className="patient-main-info">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{patient.firstName} {patient.lastName}</h1>
              <p className="text-gray-500 mb-2">{patient.condition}</p>
              <div className="patient-meta">
                <span>{patient.email}</span>
                <span>{patient.phone}</span>
                <span>{calculateAge(patient.dateOfBirth)} years old</span>
              </div>
            </div>
            <div className="patient-stats">
              <div className="stat">
                <span className="text-2xl font-bold text-gray-800">{completedAppointments}</span>
                <span className="text-xs text-gray-500 uppercase">Visits</span>
              </div>
              <div className="stat">
                <span className="text-2xl font-bold text-gray-800">{upcomingAppointments}</span>
                <span className="text-xs text-gray-500 uppercase">Upcoming</span>
              </div>
              <div className="stat">
                <span className="text-2xl font-bold text-gray-800">${totalSpent.toLocaleString()}</span>
                <span className="text-xs text-gray-500 uppercase">Total Billed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="details-grid">
            <div className="detail-item">
              <label className="text-xs text-gray-500 uppercase block mb-1">Address</label>
              <p className="text-gray-800">{patient.address}, {patient.city}, {patient.state} {patient.zipCode}</p>
            </div>
            <div className="detail-item">
              <label className="text-xs text-gray-500 uppercase block mb-1">Date of Birth</label>
              <p className="text-gray-800">{formatDate(patient.dateOfBirth)}</p>
            </div>
            <div className="detail-item">
              <label className="text-xs text-gray-500 uppercase block mb-1">Emergency Contact</label>
              <p className="text-gray-800">{patient.emergencyContact} - {patient.emergencyPhone}</p>
            </div>
            <div className="detail-item">
              <label className="text-xs text-gray-500 uppercase block mb-1">Insurance</label>
              <p className="text-gray-800">{patient.insuranceProvider} ({patient.insuranceId})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="appointments">
        <TabsList className="mb-4">
          <TabsTrigger value="appointments">Appointment History</TabsTrigger>
          <TabsTrigger value="services">Services Rendered</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <div className="appointments-list">
            {appointments.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No appointments found</p>
            ) : (
              appointments.map(apt => (
                <Card key={apt.id} className={`mb-3 border-l-4 ${
                  apt.status === 'completed' ? 'border-l-emerald-500' :
                  apt.status === 'missed' ? 'border-l-amber-500' :
                  apt.status === 'cancelled' ? 'border-l-red-500' :
                  'border-l-blue-500'
                } ${apt.status === 'cancelled' || apt.status === 'missed' ? 'opacity-70' : ''}`}>
                  <CardContent className="p-4">
                    <div className="appointment-card-inner">
                      <div className="apt-date-time">
                        <div className="font-semibold text-gray-800">{formatDate(apt.date)}</div>
                        <div className="text-sm text-gray-500">{formatTime(apt.time)}</div>
                      </div>
                      <div className="apt-details">
                        <div className="font-medium text-gray-800 mb-1">{apt.provider}</div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {apt.services.map(s => (
                            <Badge key={s.code} variant="secondary" className="text-xs">{s.name}</Badge>
                          ))}
                        </div>
                        {apt.notes && <div className="text-sm text-gray-500 italic">{apt.notes}</div>}
                      </div>
                      <div className="apt-status">
                        <Badge variant={getStatusBadgeVariant(apt.status)}>
                          {apt.status}
                        </Badge>
                        <div className="text-lg font-semibold text-gray-800 mt-2">
                          ${apt.services.reduce((sum, s) => sum + s.price, 0)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="services">
          {patientServices.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No services rendered yet</p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Times Used</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientServices.map(service => (
                    <TableRow key={service.code}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell><code className="bg-blue-50 px-2 py-0.5 rounded text-sm">{service.code}</code></TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>{service.count}</TableCell>
                      <TableCell className="text-right font-semibold">${service.totalSpent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right font-bold">${totalSpent}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Appointment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment for {patient.firstName} {patient.lastName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAppointment}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date *</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment({...newAppointment, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Time *</label>
                  <select
                    className="modal-input"
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

              <div>
                <label className="text-sm font-medium mb-1 block">Provider *</label>
                <select
                  className="modal-input"
                  value={newAppointment.provider}
                  onChange={e => setNewAppointment({...newAppointment, provider: e.target.value})}
                >
                  <option value="Dr. Smith">Dr. Smith</option>
                  <option value="Dr. Johnson">Dr. Johnson</option>
                  <option value="Dr. Williams">Dr. Williams</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Services</label>
                <div className="services-checkbox-grid">
                  {services.map(service => (
                    <label key={service.code} className="service-checkbox">
                      <input
                        type="checkbox"
                        checked={newAppointment.services.includes(service.code)}
                        onChange={() => handleServiceToggle(service.code)}
                      />
                      <span className="text-sm">{service.name} (${service.price})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  className="modal-input"
                  value={newAppointment.notes}
                  onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows="3"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Schedule Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PatientView
