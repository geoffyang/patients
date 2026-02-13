import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockAppointments, mockPatients } from '../data/mockPatients'
import './CalendarView.css'

function CalendarView() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('week') // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showShortcuts, setShowShortcuts] = useState(false)

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
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

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

  // Get week dates
  const getWeekDates = () => {
    const dates = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Get month dates
  const getMonthDates = () => {
    const dates = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Start from the Sunday of the week containing the 1st
    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())

    // End on the Saturday of the week containing the last day
    const end = new Date(lastDay)
    end.setDate(end.getDate() + (6 - end.getDay()))

    let current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return mockAppointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const formatDateHeader = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

  const handleAppointmentClick = (appointment) => {
    navigate(`/patient/${appointment.patientId}`)
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: '#27ae60',
      scheduled: '#3498db',
      cancelled: '#e74c3c'
    }
    return colors[status] || '#7f8c8d'
  }

  // Generate mini month data for year view sidebar
  const getMiniMonthDates = (year, month) => {
    const dates = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Start from the Sunday of the week containing the 1st
    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())

    // Generate 6 weeks of dates
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

  // Get the year to display in sidebar (centered around current date)
  const sidebarYear = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="calendar-view">
      {/* Sidebar with Year View */}
      <aside className="cal-sidebar">
        <div className="sidebar-header">
          <button
            className="year-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))}
          >
            ‹
          </button>
          <span className="sidebar-year">{sidebarYear}</span>
          <button
            className="year-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))}
          >
            ›
          </button>
        </div>
        <div className="mini-months-container">
          {months.map(month => {
            const miniDates = getMiniMonthDates(sidebarYear, month)
            const monthName = new Date(sidebarYear, month, 1).toLocaleDateString('en-US', { month: 'short' })
            const isCurrentViewMonth = currentDate.getMonth() === month && currentDate.getFullYear() === sidebarYear

            return (
              <div
                key={month}
                className={`mini-month ${isCurrentViewMonth ? 'active' : ''}`}
                onClick={() => handleMiniMonthClick(sidebarYear, month)}
              >
                <div className="mini-month-header">{monthName}</div>
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
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Calendar Area */}
      <div className="cal-main">
      {/* Header */}
      <header className="cal-header">
        <div className="cal-header-left">
          <button className="btn-today" onClick={goToToday}>Today</button>
          <div className="nav-buttons">
            <button onClick={goToPrev} title="Previous (k or ←)">‹</button>
            <button onClick={goToNext} title="Next (j or →)">›</button>
          </div>
          <h1>{formatDateHeader()}</h1>
        </div>
        <div className="cal-header-right">
          <button
            className="btn-shortcuts"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
          >
            ⌨️
          </button>
          <div className="view-switcher">
            <button
              className={view === 'day' ? 'active' : ''}
              onClick={() => setView('day')}
              title="Day view (d)"
            >
              Day
            </button>
            <button
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
              title="Week view (w)"
            >
              Week
            </button>
            <button
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
              title="Month view (m)"
            >
              Month
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Content */}
      <div className="cal-content">
        {/* Day View */}
        {view === 'day' && (
          <div className="day-view">
            <div className="time-grid">
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
                          onClick={() => handleAppointmentClick(apt)}
                        >
                          <div className="apt-time">{formatTime(apt.time)}</div>
                          <div className="apt-patient">{getPatientName(apt.patientId)}</div>
                          <div className="apt-provider">{apt.provider}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
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
                <div key={dayIndex} className="day-column">
                  {hours.map(hour => (
                    <div key={hour} className="hour-cell">
                      {getAppointmentsForDate(date)
                        .filter(apt => parseInt(apt.time.split(':')[0]) === hour)
                        .map(apt => (
                          <div
                            key={apt.id}
                            className="week-appointment"
                            style={{ backgroundColor: getStatusColor(apt.status) }}
                            onClick={() => handleAppointmentClick(apt)}
                            title={`${formatTime(apt.time)} - ${getPatientName(apt.patientId)}`}
                          >
                            <span className="apt-name">{getPatientName(apt.patientId).split(' ')[0]}</span>
                          </div>
                        ))}
                    </div>
                  ))}
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
          <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h2>Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)}>×</button>
            </div>
            <div className="shortcuts-content">
              <div className="shortcut-group">
                <h3>Navigation</h3>
                <div className="shortcut-item">
                  <kbd>t</kbd>
                  <span>Go to today</span>
                </div>
                <div className="shortcut-item">
                  <kbd>j</kbd> or <kbd>→</kbd>
                  <span>Next period</span>
                </div>
                <div className="shortcut-item">
                  <kbd>k</kbd> or <kbd>←</kbd>
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
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="cal-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#3498db' }}></span>
          Scheduled
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#27ae60' }}></span>
          Completed
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#e74c3c' }}></span>
          Cancelled
        </div>
      </div>
      </div>{/* End cal-main */}
    </div>
  )
}

export default CalendarView
