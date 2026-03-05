// src/components/admin/DataTable.jsx
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'

export default function DataTable({
  columns,
  data,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) {
  const [sortOrder, setSortOrder] = useState('desc')
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(true)
  const scrollContainerRef = useRef(null)

  // Separate actions column from other columns
  const actionsColumn = columns.find(col => col.key === 'actions')
  const dataColumns = columns.filter(col => col.key !== 'actions')

  // Check scroll position for shadows
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftShadow(scrollLeft > 0)
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll)
      checkScroll()
      window.addEventListener('resize', checkScroll)
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  // Sort data by ID
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return [...data].sort((a, b) => {
      const idA = a.displayId || a.id || 0
      const idB = b.displayId || b.id || 0
      
      const numA = typeof idA === 'number' ? idA : parseInt(idA) || 0
      const numB = typeof idB === 'number' ? idB : parseInt(idB) || 0
      
      return sortOrder === 'desc' ? numB - numA : numA - numB
    })
  }, [data, sortOrder])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Control */}
      <div className="flex justify-end">
        <button
          onClick={toggleSort}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowUpDown size={16} className="text-gray-600" />
          <span className="font-medium">Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Table Container with Border and Shadow */}
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Left Shadow Indicator */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white to-transparent pointer-events-none z-10" />
        )}
        
        {/* Right Shadow Indicator */}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white to-transparent pointer-events-none z-10" />
        )}

        {/* Scrollable Table Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-visible"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {dataColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.key === 'id' && (
                        <span className={`text-xs ${sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}>
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {/* Actions Header - Sticky */}
                {actionsColumn && (
                  <th className="sticky right-0 bg-gray-50 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2">
                      {actionsColumn.label}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <tr 
                  key={row.id || index} 
                  className="hover:bg-blue-50/50 transition-colors duration-150 group"
                >
                  {dataColumns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {col.render ? col.render(row) : (
                        <span className={!row[col.key] ? 'text-gray-400' : 'text-gray-900'}>
                          {row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  {/* Actions Cell - Sticky */}
                  {actionsColumn && (
                    <td className="sticky right-0 bg-white group-hover:bg-blue-50/50 px-6 py-4 text-sm text-gray-900 whitespace-nowrap shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-3">
                        {actionsColumn.render(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td
                    colSpan={dataColumns.length + (actionsColumn ? 1 : 0)}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg">🚗</span>
                      <span>No vehicles found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> entries
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white shadow-sm'
              }`}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">{currentPage}</span>
              <span className="text-sm text-gray-500">/</span>
              <span className="text-sm text-gray-600">{totalPages}</span>
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white shadow-sm'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}