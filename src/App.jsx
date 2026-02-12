import { useState } from 'react'
import './App.css'

const themes = ['professional', 'hardcore', 'turtles', 'soft']

const ICONS = {
  turtle: '🐢',
  fire: '🔥',
  medical: '⚕️',
  flower: '🌼',
  cherry: '🌸',
  skull: '💀',
  warning: '⚠️',
  muscle: '💪',
  heart: '💕',
  herb: '🌿',
  check: '✓',
  left: '←',
  right: '→'
}

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContact: '',
  emergencyPhone: '',
  chiefComplaint: '',
  painLocation: [],
  painDuration: '',
  painIntensity: '5',
  painType: [],
  previousChiropractic: '',
  previousTreatments: [],
  currentMedications: '',
  allergies: '',
  surgeries: '',
  conditions: [],
  occupation: '',
  exerciseFrequency: '',
  smokingStatus: '',
  pregnancyStatus: '',
  additionalNotes: ''
}

const painLocations = [
  'Neck', 'Upper Back', 'Mid Back', 'Lower Back', 'Shoulders',
  'Arms', 'Hands', 'Hips', 'Legs', 'Feet', 'Head/Jaw'
]

const painTypes = [
  'Sharp', 'Dull', 'Aching', 'Burning', 'Throbbing',
  'Shooting', 'Stiffness', 'Numbness', 'Tingling'
]

const previousTreatmentOptions = [
  'Physical Therapy', 'Massage', 'Acupuncture', 'Injections',
  'Surgery', 'Medication', 'Other Chiropractic', 'None'
]

const medicalConditions = [
  'Arthritis', 'Diabetes', 'Heart Disease', 'High Blood Pressure',
  'Osteoporosis', 'Fibromyalgia', 'Scoliosis', 'Herniated Disc',
  'Sciatica', 'Migraines', 'Cancer', 'None'
]

function App() {
  const [theme, setTheme] = useState('professional')
  const [formData, setFormData] = useState(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      const currentArray = formData[name] || []
      if (checked) {
        setFormData({ ...formData, [name]: [...currentArray, value] })
      } else {
        setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const exportToCSV = () => {
    const headers = Object.keys(formData)
    const values = Object.values(formData).map(val =>
      Array.isArray(val) ? val.join('; ') : val
    )
    const csvContent = [
      headers.join(','),
      values.map(v => `"${v}"`).join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient_intake_${formData.lastName}_${formData.firstName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    exportToCSV()
    setSubmitted(true)
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setSubmitted(false)
    setCurrentSection(0)
  }

  function getIcon(type) {
    if (theme === 'turtles') return ICONS.turtle
    if (theme === 'hardcore') {
      const icons = { contact: ICONS.skull, pain: ICONS.fire, medical: ICONS.warning, lifestyle: ICONS.muscle }
      return icons[type]
    }
    if (theme === 'soft') {
      const icons = { contact: ICONS.cherry, pain: ICONS.heart, medical: ICONS.herb, lifestyle: ICONS.flower }
      return icons[type]
    }
    return ''
  }

  const sections = [
    { title: 'Contact Info', icon: getIcon('contact') },
    { title: 'Pain Assessment', icon: getIcon('pain') },
    { title: 'Medical History', icon: getIcon('medical') },
    { title: 'Lifestyle', icon: getIcon('lifestyle') }
  ]

  const getThemeTitle = () => {
    const titles = {
      professional: 'Spine & Wellness Chiropractic',
      hardcore: 'IRON SPINE CHIROPRACTIC',
      turtles: 'Turtle Shell Chiropractic',
      soft: 'Gentle Care Chiropractic'
    }
    return titles[theme]
  }

  const getThemeSubtitle = () => {
    const subtitles = {
      professional: 'Patient Intake Form',
      hardcore: 'CRUSH YOUR PAIN - INTAKE FORM',
      turtles: 'Slow & Steady Healing Starts Here!',
      soft: 'Your Wellness Journey Begins'
    }
    return subtitles[theme]
  }

  const getLogoIcon = () => {
    const logos = {
      turtles: ICONS.turtle,
      hardcore: ICONS.fire,
      professional: ICONS.medical,
      soft: ICONS.flower
    }
    return logos[theme]
  }

  if (submitted) {
    return (
      <div className={`app ${theme}`}>
        <div className="success-container">
          <div className="success-icon">
            {theme === 'turtles' ? ICONS.turtle : theme === 'hardcore' ? ICONS.fire : theme === 'soft' ? ICONS.cherry : ICONS.check}
          </div>
          <h1>
            {theme === 'hardcore' ? 'SUBMISSION COMPLETE!' :
             theme === 'turtles' ? 'Shell-ebration Time!' :
             theme === 'soft' ? 'Wonderful!' :
             'Thank You!'}
          </h1>
          <p>
            {theme === 'hardcore' ? 'Your intake form has been DOMINATED. Prepare for spinal domination.' :
             theme === 'turtles' ? "Your form has safely crossed the road! We'll see you soon!" :
             theme === 'soft' ? 'Your information has been received with care.' :
             'Your intake form has been submitted successfully.'}
          </p>
          <p className="csv-note">Your information has been saved to a CSV file.</p>
          <button onClick={resetForm} className="btn-primary">
            {theme === 'hardcore' ? 'SUBMIT ANOTHER' : 'Submit Another Form'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${theme}`}>
      <div className="theme-switcher">
        <span>Theme:</span>
        {themes.map(t => (
          <button
            key={t}
            className={`theme-btn ${theme === t ? 'active' : ''}`}
            onClick={() => setTheme(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <header className="header">
        <div className="logo">
          <span className="logo-icon">{getLogoIcon()}</span>
        </div>
        <h1>{getThemeTitle()}</h1>
        <p className="subtitle">{getThemeSubtitle()}</p>
      </header>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
        </div>
        <div className="progress-steps">
          {sections.map((section, index) => (
            <button
              key={index}
              className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
              onClick={() => setCurrentSection(index)}
            >
              <span className="step-number">{section.icon || index + 1}</span>
              <span className="step-title">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="intake-form">
        {currentSection === 0 && (
          <section className="form-section">
            <h2>Contact Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder={theme === 'hardcore' ? 'YOUR FIRST NAME' : 'Enter first name'} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder={theme === 'hardcore' ? 'YOUR LAST NAME' : 'Enter last name'} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
            </div>
            <div className="form-row triple">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="12345" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact</label>
                <input type="text" id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="Contact name" />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyPhone">Emergency Phone</label>
                <input type="tel" id="emergencyPhone" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} placeholder="(555) 123-4567" />
              </div>
            </div>
          </section>
        )}

        {currentSection === 1 && (
          <section className="form-section">
            <h2>{theme === 'hardcore' ? 'IDENTIFY YOUR ENEMY' : theme === 'turtles' ? 'Where Does Your Shell Hurt?' : 'Pain Assessment'}</h2>
            <div className="form-group">
              <label htmlFor="chiefComplaint">{theme === 'hardcore' ? 'WHAT BRINGS YOU TO BATTLE?' : 'What brings you in today? *'}</label>
              <textarea id="chiefComplaint" name="chiefComplaint" value={formData.chiefComplaint} onChange={handleInputChange} required rows="3" placeholder={theme === 'hardcore' ? 'DESCRIBE YOUR PAIN...' : 'Describe your main concern...'} />
            </div>
            <div className="form-group">
              <label>{theme === 'hardcore' ? 'PAIN ZONE' : 'Pain Location'} (select all that apply)</label>
              <div className="checkbox-grid">
                {painLocations.map(location => (
                  <label key={location} className="checkbox-label">
                    <input type="checkbox" name="painLocation" value={location} checked={formData.painLocation.includes(location)} onChange={handleInputChange} />
                    <span className="checkbox-custom"></span>
                    {location}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="painDuration">How long have you had this pain?</label>
                <select id="painDuration" name="painDuration" value={formData.painDuration} onChange={handleInputChange}>
                  <option value="">Select duration</option>
                  <option value="less-than-week">Less than a week</option>
                  <option value="1-4-weeks">1-4 weeks</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="over-1-year">Over 1 year</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="painIntensity">{theme === 'hardcore' ? 'PAIN LEVEL (1 = weak, 10 = BRUTAL)' : 'Pain Intensity (1-10)'}</label>
              <div className="slider-container">
                <input type="range" id="painIntensity" name="painIntensity" min="1" max="10" value={formData.painIntensity} onChange={handleInputChange} />
                <div className="slider-value">{formData.painIntensity}</div>
              </div>
              <div className="slider-labels">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
            <div className="form-group">
              <label>Pain Type (select all that apply)</label>
              <div className="checkbox-grid">
                {painTypes.map(type => (
                  <label key={type} className="checkbox-label">
                    <input type="checkbox" name="painType" value={type} checked={formData.painType.includes(type)} onChange={handleInputChange} />
                    <span className="checkbox-custom"></span>
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentSection === 2 && (
          <section className="form-section">
            <h2>{theme === 'hardcore' ? 'BATTLE HISTORY' : theme === 'turtles' ? 'Your Health Shell-ection' : 'Medical History'}</h2>
            <div className="form-group">
              <label htmlFor="previousChiropractic">Have you seen a chiropractor before?</label>
              <select id="previousChiropractic" name="previousChiropractic" value={formData.previousChiropractic} onChange={handleInputChange}>
                <option value="">Select an option</option>
                <option value="never">Never</option>
                <option value="yes-helpful">Yes, it was helpful</option>
                <option value="yes-not-helpful">Yes, but it was not helpful</option>
                <option value="yes-currently">Yes, I am currently seeing one</option>
              </select>
            </div>
            <div className="form-group">
              <label>Previous Treatments (select all that apply)</label>
              <div className="checkbox-grid">
                {previousTreatmentOptions.map(treatment => (
                  <label key={treatment} className="checkbox-label">
                    <input type="checkbox" name="previousTreatments" value={treatment} checked={formData.previousTreatments.includes(treatment)} onChange={handleInputChange} />
                    <span className="checkbox-custom"></span>
                    {treatment}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="currentMedications">Current Medications</label>
              <textarea id="currentMedications" name="currentMedications" value={formData.currentMedications} onChange={handleInputChange} rows="2" placeholder="List any medications you are currently taking..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="allergies">Allergies</label>
                <input type="text" id="allergies" name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="List any allergies..." />
              </div>
              <div className="form-group">
                <label htmlFor="surgeries">Previous Surgeries</label>
                <input type="text" id="surgeries" name="surgeries" value={formData.surgeries} onChange={handleInputChange} placeholder="List any previous surgeries..." />
              </div>
            </div>
            <div className="form-group">
              <label>Medical Conditions (select all that apply)</label>
              <div className="checkbox-grid">
                {medicalConditions.map(condition => (
                  <label key={condition} className="checkbox-label">
                    <input type="checkbox" name="conditions" value={condition} checked={formData.conditions.includes(condition)} onChange={handleInputChange} />
                    <span className="checkbox-custom"></span>
                    {condition}
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {currentSection === 3 && (
          <section className="form-section">
            <h2>{theme === 'hardcore' ? 'WARRIOR LIFESTYLE' : theme === 'turtles' ? 'Daily Shell Habits' : 'Lifestyle Information'}</h2>
            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder={theme === 'hardcore' ? 'YOUR PROFESSION' : 'Your occupation...'} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exerciseFrequency">Exercise Frequency</label>
                <select id="exerciseFrequency" name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleInputChange}>
                  <option value="">Select frequency</option>
                  <option value="none">{theme === 'hardcore' ? 'NONE (FIX THIS)' : 'None'}</option>
                  <option value="1-2-week">1-2 times per week</option>
                  <option value="3-4-week">3-4 times per week</option>
                  <option value="5-plus-week">{theme === 'hardcore' ? '5+ TIMES (WARRIOR STATUS)' : '5+ times per week'}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="smokingStatus">Smoking Status</label>
                <select id="smokingStatus" name="smokingStatus" value={formData.smokingStatus} onChange={handleInputChange}>
                  <option value="">Select status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="pregnancyStatus">Pregnancy Status (if applicable)</label>
              <select id="pregnancyStatus" name="pregnancyStatus" value={formData.pregnancyStatus} onChange={handleInputChange}>
                <option value="">Not applicable</option>
                <option value="not-pregnant">Not pregnant</option>
                <option value="pregnant">Currently pregnant</option>
                <option value="possibly">Possibly pregnant</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="additionalNotes">{theme === 'hardcore' ? 'FINAL WORDS BEFORE BATTLE' : theme === 'turtles' ? 'Anything else to shell-are?' : 'Additional Notes'}</label>
              <textarea id="additionalNotes" name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="4" placeholder={theme === 'hardcore' ? 'SPEAK YOUR TRUTH...' : 'Any additional information you would like us to know...'} />
            </div>
          </section>
        )}

        <div className="form-navigation">
          {currentSection > 0 && (
            <button type="button" className="btn-secondary" onClick={() => setCurrentSection(currentSection - 1)}>
              {theme === 'hardcore' ? `${ICONS.left} RETREAT` : `${ICONS.left} Previous`}
            </button>
          )}
          {currentSection < sections.length - 1 ? (
            <button type="button" className="btn-primary" onClick={() => setCurrentSection(currentSection + 1)}>
              {theme === 'hardcore' ? `ADVANCE ${ICONS.right}` : `Next ${ICONS.right}`}
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              {theme === 'hardcore' ? `${ICONS.fire} SUBMIT & CONQUER ${ICONS.fire}` : theme === 'turtles' ? `${ICONS.turtle} Submit Form ${ICONS.turtle}` : 'Submit Form'}
            </button>
          )}
        </div>
      </form>

      <footer className="footer">
        <p>
          {theme === 'hardcore' ? 'IRON SPINE CHIROPRACTIC - FORGING STRONGER SPINES SINCE 2024' :
           theme === 'turtles' ? 'Turtle Shell Chiropractic - Taking it slow, getting it right!' :
           theme === 'soft' ? 'Gentle Care Chiropractic - Your comfort is our priority' :
           'Spine & Wellness Chiropractic - Professional care you can trust'}
        </p>
      </footer>
    </div>
  )
}

export default App
