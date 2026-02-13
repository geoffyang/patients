import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockAppointments, mockPatients, services } from '../data/mockPatients'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog'
import './CalendarView.css'

function CalendarView() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('week') // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Drag-to-create state
  const [dragState, setDragState] = useState(null) // { isDragging, dayDate, startMin, endMin, columnEl }
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAptForm, setNewAptForm] = useState({
    date: '', startTime: '', endTime: '', patientId: '', provider: 'Dr. Smith', notes: ''
  })
  const [localAppointments, setLocalAppointments] = useState([])
  const dragRef = useRef(null)

  const getPatientName = (patientId) => {
    const patient = mockPatients.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Navigation functions
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }, [])

  const goToPrev = useCallback(() => {
    const newDate = new Date(currentDate)
    if (view === 'day') newDate.setDate(newDate.getDate() - 1)
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7)
    else newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }, [currentDate, view])

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate)
    if (view === 'day') newDate.setDate(newDate.getDate() + 1)
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7)
    else newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }, [currentDate, view])

  // Keyboard shortcuts (Google Calendar inspired)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

      switch (e.key) {
        case 't':
          goToToday()
          break
        case 'j':
        case 'ArrowRight':
          goToNext()
          break
        case 'k':
        case 'ArrowLeft':
          goToPrev()
          break
        case 'd':
          setView('day')
          break
        case 'w':
          setView('week')
          break
        case 'm':
          setView('month')
          break
        case '?':
          setShowShortcuts(prev => !prev)
          break
        case 'Escape':
          setShowShortcuts(false)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToToday, goToNext, goToPrev])

  const getWeekDates = () => {
    const dates = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getMonthDates = () => {
    const dates = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(lastDay)
    end.setDate(end.getDate() + (6 - end.getDay()))
    let current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return allAppointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    } else if (view === 'week') {
      const weekDates = getWeekDates()
      const start = weekDates[0]
      const end = weekDates[6]
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      }
      return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  const handleAppointmentClick = (appointment) => {
    navigate(`/patient/${appointment.patientId}`)
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: '#22c55e',
      scheduled: '#3b82f6',
      cancelled: '#ef4444',
      missed: '#f59e0b'
    }
    return colors[status] || '#6b7280'
  }

  // Drag-to-create helpers
  const HOUR_HEIGHT = 60
  const START_HOUR = 8

  const getMinFromY = (y, containerEl) => {
    const rect = containerEl.getBoundingClientRect()
    const relY = y - rect.top + containerEl.scrollTop
    const totalMin = (relY / HOUR_HEIGHT) * 60 + START_HOUR * 60
    // snap to 15-min
    return Math.round(totalMin / 15) * 15
  }

  const minToTime = (totalMin) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const minToTop = (totalMin) => {
    return ((totalMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
  }

  const handleGridMouseDown = (e, dayDate, containerEl) => {
    if (e.button !== 0) return
    e.preventDefault()
    const startMin = getMinFromY(e.clientY, containerEl)
    const clampedStart = Math.max(START_HOUR * 60, Math.min(startMin, 19 * 60))
    dragRef.current = { dayDate, startMin: clampedStart, endMin: clampedStart, columnEl: containerEl }
    setDragState({ isDragging: true, dayDate, startMin: clampedStart, endMin: clampedStart, columnEl: containerEl })
  }

  const handleGridMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const { columnEl } = dragRef.current
    const endMin = getMinFromY(e.clientY, columnEl)
    const clampedEnd = Math.max(START_HOUR * 60, Math.min(endMin, 20 * 60))
    dragRef.current.endMin = clampedEnd
    setDragState(prev => prev ? { ...prev, endMin: clampedEnd } : null)
  }, [])

  const handleGridMouseUp = useCallback(() => {
    if (!dragRef.current) return
    const { dayDate, startMin, endMin } = dragRef.current
    dragRef.current = null

    let s = Math.min(startMin, endMin)
    let e = Math.max(startMin, endMin)
    if (e - s < 15) e = s + 30 // single click = 30 min slot

    const dateStr = dayDate.toISOString().split('T')[0]
    setNewAptForm({
      date: dateStr,
      startTime: minToTime(s),
      endTime: minToTime(e),
      patientId: mockPatients[0].id,
      provider: 'Dr. Smith',
      notes: ''
    })
    setDragState(null)
    setShowCreateModal(true)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleGridMouseMove)
    window.addEventListener('mouseup', handleGridMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleGridMouseMove)
      window.removeEventListener('mouseup', handleGridMouseUp)
    }
  }, [handleGridMouseMove, handleGridMouseUp])

  const handleCreateAppointment = (e) => {
    e.preventDefault()
    const patient = mockPatients.find(p => p.id === newAptForm.patientId)
    const newApt = {
      id: `local-${Date.now()}`,
      patientId: newAptForm.patientId,
      date: newAptForm.date,
      time: newAptForm.startTime,
      status: 'scheduled',
      services: [],
      notes: newAptForm.notes,
      provider: newAptForm.provider
    }
    setLocalAppointments(prev => [...prev, newApt])
    setShowCreateModal(false)
  }

  const allAppointments = [...mockAppointments, ...localAppointments]

  const getMiniMonthDates = (year, month) => {
    const dates = []
    const firstDay = new Date(year, month, 1)
    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())
    for (let i = 0; i < 42; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const handleMiniMonthClick = (year, month) => {
    const newDate = new Date(year, month, 1)
    setCurrentDate(newDate)
  }

  const handleMiniDayClick = (date) => {
    setCurrentDate(date)
    setSelectedDate(date)
    setView('day')
  }

  const sidebarYear = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="calendar-view">
      {/* Sidebar with Year View */}
      <aside className="cal-sidebar">
        <div className="sidebar-header">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))}
          >
            &#8249;
          </Button>
          <span className="text-sm font-medium text-foreground">{sidebarYear}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))}
          >
            &#8250;
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="mini-months-container">
            {months.map(month => {
              const miniDates = getMiniMonthDates(sidebarYear, month)
              const monthName = new Date(sidebarYear, month, 1).toLocaleDateString('en-US', { month: 'short' })
              const isCurrentViewMonth = currentDate.getMonth() === month && currentDate.getFullYear() === sidebarYear

              return (
                <Card
                  key={month}
                  className={`mini-month cursor-pointer transition-all border-2 ${isCurrentViewMonth ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'}`}
                  onClick={() => handleMiniMonthClick(sidebarYear, month)}
                >
                  <div className={`mini-month-header ${isCurrentViewMonth ? 'text-blue-600' : ''}`}>{monthName}</div>
                  <div className="mini-month-grid">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="mini-day-header">{day}</div>
                    ))}
                    {miniDates.map((date, i) => {
                      const isInMonth = date.getMonth() === month
                      const isTodayDate = isToday(date)
                      const hasAppts = getAppointmentsForDate(date).length > 0

                      return (
                        <div
                          key={i}
                          className={`mini-day ${!isInMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${hasAppts ? 'has-appointments' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isInMonth) handleMiniDayClick(date)
                          }}
                        >
                          {isInMonth ? date.getDate() : ''}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Calendar Area */}
      <div className="cal-main">
        {/* Header */}
        <header className="cal-header">
          <div className="cal-header-left">
            <Button variant="outline" onClick={goToToday}>Today</Button>
            <div className="flex">
              <Button variant="outline" className="rounded-r-none" onClick={goToPrev} title="Previous (k or ←)">&#8249;</Button>
              <Button variant="outline" className="rounded-l-none border-l-0" onClick={goToNext} title="Next (j or →)">&#8250;</Button>
            </div>
            <h1 className="text-xl font-normal text-foreground">{formatDateHeader()}</h1>
          </div>
          <div className="cal-header-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)"
            >
              <span className="text-lg">&#9000;</span>
            </Button>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={view === 'day' ? 'secondary' : 'ghost'}
                className="rounded-none border-0 text-xs h-8"
                onClick={() => setView('day')}
                title="Day view (d)"
              >
                Day
              </Button>
              <Button
                variant={view === 'week' ? 'secondary' : 'ghost'}
                className="rounded-none border-0 border-x text-xs h-8"
                onClick={() => setView('week')}
                title="Week view (w)"
              >
                Week
              </Button>
              <Button
                variant={view === 'month' ? 'secondary' : 'ghost'}
                className="rounded-none border-0 text-xs h-8"
                onClick={() => setView('month')}
                title="Month view (m)"
              >
                Month
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Content */}
        <div className="cal-content">
          {/* Day View */}
          {view === 'day' && (
            <div className="day-view">
              <div
                className="time-grid day-drag-container"
                onMouseDown={(e) => {
                  const container = e.currentTarget
                  handleGridMouseDown(e, currentDate, container)
                }}
              >
                {hours.map(hour => (
                  <div key={hour} className="time-slot">
                    <div className="time-label">
                      {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    <div className="time-content">
                      {getAppointmentsForDate(currentDate)
                        .filter(apt => parseInt(apt.time.split(':')[0]) === hour)
                        .map(apt => (
                          <div
                            key={apt.id}
                            className="appointment-block"
                            style={{ borderLeftColor: getStatusColor(apt.status) }}
                            onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt) }}
                          >
                            <div className="apt-time">{formatTime(apt.time)}</div>
                            <div className="apt-patient">{getPatientName(apt.patientId)}</div>
                            <div className="apt-provider">{apt.provider}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                {/* Drag preview for day view */}
                {dragState && dragState.isDragging && dragState.dayDate.toDateString() === currentDate.toDateString() && (() => {
                  const s = Math.min(dragState.startMin, dragState.endMin)
                  const e = Math.max(dragState.startMin, dragState.endMin)
                  const top = minToTop(s)
                  const height = Math.max(((e - s) / 60) * HOUR_HEIGHT, 15)
                  return (
                    <div className="drag-preview" style={{ top: `${top}px`, height: `${height}px`, left: '60px', right: '0' }}>
                      <span className="drag-preview-time">{formatTime(minToTime(s))} - {formatTime(minToTime(e))}</span>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Week View */}
          {view === 'week' && (
            <div className="week-view">
              <div className="week-header">
                <div className="time-gutter"></div>
                {getWeekDates().map((date, i) => (
                  <div
                    key={i}
                    className={`week-day-header ${isToday(date) ? 'today' : ''}`}
                  >
                    <span className="day-name">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`day-number ${isToday(date) ? 'today-circle' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="week-grid">
                <div className="time-column">
                  {hours.map(hour => (
                    <div key={hour} className="time-label">
                      {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                  ))}
                </div>
                {getWeekDates().map((date, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="day-column"
                    onMouseDown={(e) => handleGridMouseDown(e, date, e.currentTarget)}
                  >
                    {hours.map(hour => (
                      <div key={hour} className="hour-cell">
                        {getAppointmentsForDate(date)
                          .filter(apt => parseInt(apt.time.split(':')[0]) === hour)
                          .map(apt => (
                            <div
                              key={apt.id}
                              className="week-appointment"
                              style={{ backgroundColor: getStatusColor(apt.status) }}
                              onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt) }}
                              title={`${formatTime(apt.time)} - ${getPatientName(apt.patientId)}`}
                            >
                              <span className="apt-name">{getPatientName(apt.patientId).split(' ')[0]}</span>
                            </div>
                          ))}
                      </div>
                    ))}
                    {/* Drag preview for week view */}
                    {dragState && dragState.isDragging && dragState.dayDate.toDateString() === date.toDateString() && (() => {
                      const s = Math.min(dragState.startMin, dragState.endMin)
                      const e = Math.max(dragState.startMin, dragState.endMin)
                      const top = minToTop(s)
                      const height = Math.max(((e - s) / 60) * HOUR_HEIGHT, 15)
                      return (
                        <div className="drag-preview" style={{ top: `${top}px`, height: `${height}px` }}>
                          <span className="drag-preview-time">{formatTime(minToTime(s))}</span>
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month View */}
          {view === 'month' && (
            <div className="month-view">
              <div className="month-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="month-day-header">{day}</div>
                ))}
              </div>
              <div className="month-grid">
                {getMonthDates().map((date, i) => {
                  const appointments = getAppointmentsForDate(date)
                  return (
                    <div
                      key={i}
                      className={`month-cell ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                      onClick={() => {
                        setCurrentDate(date)
                        setView('day')
                      }}
                    >
                      <span className={`month-date ${isToday(date) ? 'today-circle' : ''}`}>
                        {date.getDate()}
                      </span>
                      <div className="month-appointments">
                        {appointments.slice(0, 3).map(apt => (
                          <div
                            key={apt.id}
                            className="month-apt"
                            style={{ backgroundColor: getStatusColor(apt.status) }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAppointmentClick(apt)
                            }}
                          >
                            {formatTime(apt.time)} {getPatientName(apt.patientId).split(' ')[0]}
                          </div>
                        ))}
                        {appointments.length > 3 && (
                          <div className="more-appointments">
                            +{appointments.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
            <Card className="shortcuts-modal p-0" onClick={e => e.stopPropagation()}>
              <div className="shortcuts-header">
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(false)}>
                  &times;
                </Button>
              </div>
              <div className="shortcuts-content">
                <div className="shortcut-group">
                  <h3>Navigation</h3>
                  <div className="shortcut-item">
                    <kbd>t</kbd>
                    <span>Go to today</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>j</kbd> or <kbd>&rarr;</kbd>
                    <span>Next period</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>k</kbd> or <kbd>&larr;</kbd>
                    <span>Previous period</span>
                  </div>
                </div>
                <div className="shortcut-group">
                  <h3>Views</h3>
                  <div className="shortcut-item">
                    <kbd>d</kbd>
                    <span>Day view</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>w</kbd>
                    <span>Week view</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>m</kbd>
                    <span>Month view</span>
                  </div>
                </div>
                <div className="shortcut-group">
                  <h3>Other</h3>
                  <div className="shortcut-item">
                    <kbd>?</kbd>
                    <span>Show shortcuts</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Close modal</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="cal-legend">
          <div className="legend-item">
            <Badge variant="info" className="text-xs">Scheduled</Badge>
          </div>
          <div className="legend-item">
            <Badge variant="success" className="text-xs">Completed</Badge>
          </div>
          <div className="legend-item">
            <Badge variant="warning" className="text-xs">Missed</Badge>
          </div>
          <div className="legend-item">
            <Badge variant="destructive" className="text-xs">Cancelled</Badge>
          </div>
        </div>
      </div>{/* End cal-main */}

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              {newAptForm.date && new Date(newAptForm.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
              {' '}{newAptForm.startTime && formatTime(newAptForm.startTime)} - {newAptForm.endTime && formatTime(newAptForm.endTime)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time</label>
                  <input
                    type="time"
                    className="create-modal-input"
                    value={newAptForm.startTime}
                    onChange={e => setNewAptForm({...newAptForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time</label>
                  <input
                    type="time"
                    className="create-modal-input"
                    value={newAptForm.endTime}
                    onChange={e => setNewAptForm({...newAptForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Patient *</label>
                <select
                  className="create-modal-input"
                  value={newAptForm.patientId}
                  onChange={e => setNewAptForm({...newAptForm, patientId: e.target.value})}
                  required
                >
                  {[...mockPatients]
                    .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Provider *</label>
                <select
                  className="create-modal-input"
                  value={newAptForm.provider}
                  onChange={e => setNewAptForm({...newAptForm, provider: e.target.value})}
                >
                  <option value="Dr. Smith">Dr. Smith</option>
                  <option value="Dr. Johnson">Dr. Johnson</option>
                  <option value="Dr. Williams">Dr. Williams</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  className="create-modal-input"
                  value={newAptForm.notes}
                  onChange={e => setNewAptForm({...newAptForm, notes: e.target.value})}
                  rows="2"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CalendarView
