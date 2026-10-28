import { useState, useEffect } from 'react'
import axios from 'axios'

const CountryDetail = ({ country }) => (
  <div>
    <h2>{country.name.common}</h2>
    <p>capital {country.capital[0]}</p>
    <p>area {country.area}</p>
    <h3>languages</h3>
    <ul>
      {Object.values(country.languages).map(lang => <li key={lang}>{lang}</li>)}
    </ul>
    <img src={country.flags.png} alt={`flag of ${country.name.common}`} width={150} />
  </div>
)

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all').then(response => {
      setCountries(response.data)
    })
  }, [])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setSelected(null)
  }

  const filtered = countries.filter(c =>
    c.name.common.toLowerCase().includes(filter.toLowerCase())
  )

  const renderResults = () => {
    if (filter === '') return null
    if (selected) return <CountryDetail country={selected} />
    if (filtered.length > 10) return <p>Too many matches, specify another filter</p>
    if (filtered.length === 1) return <CountryDetail country={filtered[0]} />
    return (
      <ul>
        {filtered.map(c => (
          <li key={c.cca3}>
            {c.name.common}
            <button onClick={() => setSelected(c)}>show</button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <div>find countries <input value={filter} onChange={handleFilterChange} /></div>
      {renderResults()}
    </div>
  )
}

export default App
