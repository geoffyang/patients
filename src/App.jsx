import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import IntakeForm from './components/IntakeForm'
import PatientView from './components/PatientView'
import CalendarView from './components/CalendarView'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<IntakeForm />} />
        <Route path="/patient/:patientId" element={<PatientView />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Routes>
    </HashRouter>
  )
}

export default App
