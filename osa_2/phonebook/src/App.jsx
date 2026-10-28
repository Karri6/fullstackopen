import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'

const Notification = ({ message, type }) => {
  if (!message) return null
  return <div className={type}>{message}</div>
}

const Filter = ({ filter, onChange }) => (
  <div>filter shown with: <input value={filter} onChange={onChange} /></div>
)

const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => (
  <form onSubmit={onSubmit}>
    <div>name: <input value={newName} onChange={onNameChange} /></div>
    <div>number: <input value={newNumber} onChange={onNumberChange} /></div>
    <div><button type="submit">add</button></div>
  </form>
)

const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map(person =>
      <p key={person.id}>
        {person.name} {person.number}
        <button onClick={() => onDelete(person.id, person.name)}>delete</button>
      </p>
    )}
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [filter, setFilter] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    personService.getAll().then(data => setPersons(data))
  }, [])

  const notify = (message, type = 'success') => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const existing = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())
    if (existing) {
      if (window.confirm(`${existing.name} is already added to phonebook, replace the old number with a new one?`)) {
        personService.update(existing.id, { ...existing, number: newNumber })
          .then(data => {
            setPersons(persons.map(p => p.id !== existing.id ? p : data))
            setNewName('')
            setNewNumber('')
            notify(`Updated ${existing.name}'s number`)
          })
          .catch(() => {
            notify(`${existing.name} was already removed from the server`, 'error')
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }
      return
    }
    const person = { name: newName, number: newNumber }
    personService.create(person).then(data => {
      setPersons(persons.concat(data))
      setNewName('')
      setNewNumber('')
      notify(`Added ${newName}`)
    })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService.remove(id).then(() => {
        setPersons(persons.filter(p => p.id !== id))
      })
    }
  }

  const filteredPersons = persons.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <Filter filter={filter} onChange={e => setFilter(e.target.value)} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={handleSubmit}
        newName={newName}
        onNameChange={e => setNewName(e.target.value)}
        newNumber={newNumber}
        onNumberChange={e => setNewNumber(e.target.value)}
      />
      <h3>Numbers</h3>
      <Persons persons={filteredPersons} onDelete={handleDelete} />
    </div>
  )
}

export default App
