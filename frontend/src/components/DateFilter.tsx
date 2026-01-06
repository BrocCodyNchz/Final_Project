interface DateFilterProps {
  dateRange: {
    startDate: string
    endDate: string
  }
  onDateRangeChange: (dateRange: { startDate: string; endDate: string }) => void
  onFilter: () => void
  onClear: () => void
}

function DateFilter({ dateRange, onDateRangeChange, onFilter, onClear }: DateFilterProps) {
  return (
    <div className="date-filter-container">
      <div className="date-filter-group">
        <label className="date-filter-label">Start Date</label>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => onDateRangeChange({...dateRange, startDate: e.target.value})}
          className="date-filter-input"
        />
      </div>
      
      <div className="date-filter-group">
        <label className="date-filter-label">End Date</label>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => onDateRangeChange({...dateRange, endDate: e.target.value})}
          className="date-filter-input"
        />
      </div>
      
      <div className="date-filter-group">
        <label className="date-filter-label">&nbsp;</label>
        <div className="flex gap-2">
          <button onClick={onFilter} className="date-filter-button">
            Apply Filter
          </button>
          <button onClick={onClear} className="date-filter-clear">
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateFilter