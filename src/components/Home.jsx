import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPatients, getAppointmentsByPatientId } from '../data/mockPatients'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
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
          <h1 className="text-2xl font-bold text-gray-800">Spine & Wellness</h1>
          <p className="text-sm text-gray-500">Patient Management System</p>
        </div>
        <div className="header-right">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
          <Button onClick={() => navigate('/intake')}>
            + New Patient
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <Card>
          <CardContent className="p-5 text-center">
            <span className="text-3xl font-bold text-blue-500 block">{mockPatients.length}</span>
            <span className="text-xs text-gray-500 uppercase">Total Patients</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <span className="text-3xl font-bold text-blue-500 block">
              {mockPatients.filter(p => getUpcomingAppointment(p.id) !== undefined).length}
            </span>
            <span className="text-xs text-gray-500 uppercase">Upcoming Appointments</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <span className="text-3xl font-bold text-blue-500 block">3</span>
            <span className="text-xs text-gray-500 uppercase">Providers</span>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Input
            type="text"
            placeholder="Search patients by name, email, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent</option>
          <option value="condition">Sort by Condition</option>
        </select>
      </div>

      {/* Patient List */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Patient</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map(patient => {
              const upcoming = getUpcomingAppointment(patient.id)
              return (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/patient/${patient.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="patient-avatar-sm">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</div>
                        <div className="text-xs text-gray-400">{patient.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{patient.condition}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{patient.phone}</div>
                    <div className="text-xs text-gray-400">{patient.email}</div>
                  </TableCell>
                  <TableCell>
                    {upcoming ? (
                      <Badge variant="success">
                        {formatDate(upcoming.date)} at {upcoming.time}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">No upcoming</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/patient/${patient.id}`)
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No patients found matching &quot;{searchTerm}&quot;</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/intake')}>
            New Patient Intake
          </Button>
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            View Calendar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home
