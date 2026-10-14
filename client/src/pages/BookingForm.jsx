import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// TODO: build the Book a Room page — see README.md "Your task".
// This page is already routed at /bookings/new (book) and /bookings/:id (edit),
// and both routes are wrapped in <ProtectedRoute>.

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      return
    }

    let isCurrent = true

    async function loadBooking() {
      setError('')
      try {
        const res = await api.get(`/bookings/${id}`)
        if (!isCurrent) return

        const booking = res.data.booking
        setForm({
          roomNumber: booking.roomNumber,
          startDate: booking.startDate.slice(0, 10),
          endDate: booking.endDate.slice(0, 10),
          purpose: booking.purpose || ''
        })
      } catch (err) {
        if (isCurrent) {
          setError(err?.response?.data?.message || 'Failed to load booking')
        }
      }
    }

    loadBooking()
    return () => {
      isCurrent = false
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="roomNumber">Room number</label>
          <input
            className="input"
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="e.g. B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">Start date</label>
          <input
            className="input"
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="endDate">End date</label>
          <input
            className="input"
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="purpose">Purpose (optional)</label>
          <textarea
            className="input"
            id="purpose"
            name="purpose"
            rows="3"
            value={form.purpose}
            onChange={onChange}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : id ? 'Update booking' : 'Create booking'}
        </button>
      </form>
    </div>
  )
}
