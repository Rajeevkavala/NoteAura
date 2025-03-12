import React from 'react'

const PdfViewer = ({ fileUrl }) => {
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="mt-2 rounded-lg shadow-md h-[90vh] animate-pulse">
      <div className="w-full h-full bg-gray-200"></div>
    </div>
  )

  // Check if fileUrl is valid
  if (!fileUrl) {
    return (
      <div className="mt-2 rounded-lg shadow-md h-[90vh] flex items-center justify-center">
        <p className="text-gray-500">No PDF file available</p>
      </div>
    )
  }

  // Add a small delay to show loading state (optional)
  // If fileUrl is coming from an API, you might want to add a proper loading state
  const isLoading = !fileUrl.includes('http') // Simple check, adjust based on your needs

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="mt-2 rounded-lg shadow-md">
      <iframe
        src={fileUrl + "#toolbar=0"}
        width="100%"
        className="h-[90vh]"
        title="PDF Viewer"
        onLoad={() => console.log('PDF loaded')} // Optional: for debugging
      />
    </div>
  )
}

export default PdfViewer