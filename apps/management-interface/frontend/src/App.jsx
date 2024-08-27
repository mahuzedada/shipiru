import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [apps, setApps] = useState([])
  const [services, setServices] = useState([])
  const [deployments, setDeployments] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')


  const [newAppName, setNewAppName] = useState('')
  const [newAppDescription, setNewAppDescription] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceAppId, setNewServiceAppId] = useState('')
  const [newDeploymentServiceId, setNewDeploymentServiceId] = useState('')
  const [newDeploymentVersion, setNewDeploymentVersion] = useState('')
  const [newAlertName, setNewAlertName] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState('')
  const [newAlertThreshold, setNewAlertThreshold] = useState('')
  const [newAlertServiceId, setNewAlertServiceId] = useState('')


  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      fetchData()
    }
  }, [])
  const fetchData = () => {
    fetchApps()
    fetchServices()
    fetchDeployments()
    fetchAlerts()
  }

  const login = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/login', { username, password })
      localStorage.setItem('token', response.data.token)
      setIsLoggedIn(true)
      fetchData()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  const fetchApps = async () => {
    try {
      const response = await axios.get('/api/apps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setApps(response.data)
    } catch (error) {
      console.error('Error fetching apps:', error)
    }
  }


  const fetchServices = async () => {
    const response = await fetch('/api/services')
    const data = await response.json()
    setServices(data)
  }

  const fetchDeployments = async () => {
    const response = await fetch('/api/deployments')
    const data = await response.json()
    setDeployments(data)
  }

  const fetchAlerts = async () => {
    const response = await fetch('/api/alerts')
    const data = await response.json()
    setAlerts(data)
  }

  const handleAppSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/apps',
        { name: newAppName, description: newAppDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setNewAppName('')
      setNewAppDescription('')
      fetchApps()
    } catch (error) {
      console.error('Error adding app:', error)
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newServiceName, app_id: newServiceAppId }),
    })
    if (response.ok) {
      setNewServiceName('')
      setNewServiceAppId('')
      fetchServices()
    }
  }

  const handleDeploymentSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: newDeploymentServiceId,
        version: newDeploymentVersion,
        status: 'pending'
      }),
    })
    if (response.ok) {
      setNewDeploymentServiceId('')
      setNewDeploymentVersion('')
      fetchDeployments()
    }
  }

  const handleAlertSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAlertName,
        condition: newAlertCondition,
        threshold: newAlertThreshold,
        service_id: newAlertServiceId
      }),
    })
    if (response.ok) {
      setNewAlertName('')
      setNewAlertCondition('')
      setNewAlertThreshold('')
      setNewAlertServiceId('')
      fetchAlerts()
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="App">
        <h1>DevOps Stack Management Interface</h1>
        <form onSubmit={login}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <div className="App">
      <h1>Shipiru Management Interface</h1>
      <button onClick={logout}>Logout</button>

      <section>
        <h2>Apps</h2>
        <form onSubmit={handleAppSubmit}>
          <input
            type="text"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="App Name"
            required
          />
          <input
            type="text"
            value={newAppDescription}
            onChange={(e) => setNewAppDescription(e.target.value)}
            placeholder="App Description"
          />
          <button type="submit">Add App</button>
        </form>
        <ul>
          {apps.map((app) => (
            <li key={app.id}>{app.name} - {app.description}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Services</h2>
        <form onSubmit={handleServiceSubmit}>
          <input
            type="text"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Service Name"
            required
          />
          <input
            type="number"
            value={newServiceAppId}
            onChange={(e) => setNewServiceAppId(e.target.value)}
            placeholder="App ID"
            required
          />
          <button type="submit">Add Service</button>
        </form>
        <ul>
          {services.map((service) => (
            <li key={service.id}>{service.name} (App ID: {service.app_id})</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Deployments</h2>
        <form onSubmit={handleDeploymentSubmit}>
          <input
            type="number"
            value={newDeploymentServiceId}
            onChange={(e) => setNewDeploymentServiceId(e.target.value)}
            placeholder="Service ID"
            required
          />
          <input
            type="text"
            value={newDeploymentVersion}
            onChange={(e) => setNewDeploymentVersion(e.target.value)}
            placeholder="Version"
            required
          />
          <button type="submit">Add Deployment</button>
        </form>
        <ul>
          {deployments.map((deployment) => (
            <li key={deployment.id}>
              Service ID: {deployment.service_id}, Version: {deployment.version}, Status: {deployment.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Alerts</h2>
        <form onSubmit={handleAlertSubmit}>
          <input
            type="text"
            value={newAlertName}
            onChange={(e) => setNewAlertName(e.target.value)}
            placeholder="Alert Name"
            required
          />
          <input
            type="text"
            value={newAlertCondition}
            onChange={(e) => setNewAlertCondition(e.target.value)}
            placeholder="Condition"
            required
          />
          <input
            type="number"
            value={newAlertThreshold}
            onChange={(e) => setNewAlertThreshold(e.target.value)}
            placeholder="Threshold"
            required
          />
          <input
            type="number"
            value={newAlertServiceId}
            onChange={(e) => setNewAlertServiceId(e.target.value)}
            placeholder="Service ID"
            required
          />
          <button type="submit">Add Alert</button>
        </form>
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id}>
              {alert.name} - Condition: {alert.condition}, Threshold: {alert.threshold}, Service ID: {alert.service_id}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
