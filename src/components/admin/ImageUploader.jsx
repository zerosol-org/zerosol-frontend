// src/components/admin/ImageUploader.jsx
import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

export default function ImageUploader({ imagePreview, onImageChange, onImageRemove }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onImageChange(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageChange(file)
    }
  }

  return (
    <div>
      {imagePreview ? (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-40 w-auto object-contain border border-gray-200 rounded-lg"
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            Click or drag to upload vehicle image
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}