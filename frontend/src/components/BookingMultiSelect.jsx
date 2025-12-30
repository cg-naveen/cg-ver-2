import React, { useState, useRef, useEffect } from 'react'
import styles from './BookingMultiSelect.module.css'
import api from '../api/axios'

function BookingMultiSelect({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [services, setServices] = useState([]) // fetched list
  const menuRef = useRef(null)

  // Fetch active services once
  useEffect(() => {
    api.get('/api/services')
      .then(res => setServices(res.data))
      .catch(err => console.error('Error fetching services:', err))
  }, [])

  // Normalise incoming value:
  const normalizedValue = Array.isArray(value)
    ? value
        .map(v => {
          if (typeof v === 'string') return { name: v, quantity: 1 }
          if (v && typeof v === 'object') {
            const name = v.name ?? v.service_name ?? v.label
            const quantity = Number(v.quantity ?? 1)
            if (!name) return null
            return {
              name,
              quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1
            }
          }
          return null
        })
        .filter(Boolean)
    : []

  const selectedNames = normalizedValue.map(v => v.name)
  const qtyByName = normalizedValue.reduce((acc, v) => {
    acc[v.name] = v.quantity
    return acc
  }, {})

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleToggle = () => setOpen(o => !o)

  // Toggle service selection
  const handleSelect = (service) => {
    const { service_id, service_name } = service
    if (selectedNames.includes(service_name)) {
      onChange(normalizedValue.filter(v => v.name !== service_name))
    } else {
      onChange([...normalizedValue, { service_id, name: service_name, quantity: 1 }])
    }
  }
  

  const handleRemove = (name, e) => {
    e.stopPropagation()
    onChange(normalizedValue.filter(v => v.name !== name))
  }

  // Quantity change with max limit
  const handleQtyChange = (service, delta) => {
    const { service_id, service_name, max_quantity } = service
    onChange(
      normalizedValue.map(v => {
        if (v.name !== service_name) return v
        const current = v.quantity || 1
        const next = Math.max(1, Math.min(current + delta, max_quantity || 1))
        return {
          ...v,
          service_id,
          quantity: next
        }
      })
    )
  }
  

  return (
    <div className={styles.multiSelectContainer} ref={menuRef}>
      <div className={styles.selectedBox} onClick={handleToggle} tabIndex="0">
        {normalizedValue.length === 0 && (
          <span className={styles.placeholder}>Select services</span>
        )}

        {normalizedValue.map(item => (
          <div
            key={item.name}
            className={styles.selectedTagWrap}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.selectedTag}>
              <span className={styles.selectedTagText}>{item.name}</span>
              <span
                className={styles.removeTag}
                onClick={e => handleRemove(item.name, e)}
              >
                ×
              </span>
            </div>

            <div className={styles.qtyControlsInline}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => {
                  const service = services.find(s => s.service_name === item.name)
                  handleQtyChange(service, -1)
                }}
                aria-label={`Decrease quantity for ${item.name}`}
              >
                -
              </button>

              <span className={styles.qtyValue}>{item.quantity}</span>

              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => {
                  const service = services.find(s => s.service_name === item.name)
                  handleQtyChange(service, 1)
                }}
                aria-label={`Increase quantity for ${item.name}`}
              >
                +
              </button>
            </div>
          </div>
        ))}

        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className={styles.dropdownMenu}>
          {services.map(service => {
            const checked = selectedNames.includes(service.service_name)
            const qty = qtyByName[service.service_name] || 1

            return (
              <div key={service.service_id} className={styles.dropdownRow}>
                <label className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSelect(service)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionText}>{service.service_name}</span>
                </label>

                {checked && (
                  <div
                    className={styles.qtyControls}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => handleQtyChange(service, -1)}
                      aria-label={`Decrease quantity for ${service.service_name}`}
                    >
                      -
                    </button>

                    <span className={styles.qtyValue}>{qty}</span>

                    <button
                      type="button"
                      className={styles.qtyBtn}
                      disabled={qty >= service.max_quantity} // disable if at max
                      onClick={() => handleQtyChange(service, 1)}
                      aria-label={`Increase quantity for ${service.service_name}`}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BookingMultiSelect

