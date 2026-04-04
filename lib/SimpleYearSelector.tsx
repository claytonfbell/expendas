import React from "react"

interface SimpleYearSelectorProps {
  selectedYear?: number
  onChange: (year: number) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

const SimpleYearSelector: React.FC<SimpleYearSelectorProps> = ({
  selectedYear,
  onChange,
  label = "Year",
  placeholder = "Select a year",
  disabled = false,
  className = "",
}) => {
  const currentYear = new Date().getFullYear()
  const startYear = 1984

  // Generate array of years from 1984 to current year (2026)
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => currentYear - index
  )

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10)
    if (!isNaN(value)) {
      onChange(value)
    }
  }

  return (
    <div className={`year-selector ${className}`.trim()}>
      {label && (
        <label htmlFor="year-select" className="year-selector-label">
          {label}
        </label>
      )}
      <select
        id="year-select"
        value={selectedYear || ""}
        onChange={handleChange}
        disabled={disabled}
        className="year-selector-input"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SimpleYearSelector
