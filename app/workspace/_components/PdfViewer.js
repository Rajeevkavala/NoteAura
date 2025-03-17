import React from 'react'

const PdfViewer = ({ fileUrl }) => {
  const isMobile = window.innerWidth <= 768

  if (!fileUrl) {
    return (
      <div className="mt-2 rounded-lg shadow-md h-[90vh] flex items-center justify-center">
        <p className="text-gray-500">No PDF file available</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="mt-2 rounded-lg shadow-md h-[90vh] flex flex-col items-center justify-center">
        <p className="text-gray-500">PDF preview is not available on mobile.</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Open PDF
        </a>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg shadow-md">
      <iframe
        src={fileUrl}
        width="100%"
        className="h-[60vh] sm:h-[90vh]"
        title="PDF Viewer"
      />
    </div>
  )
}

export default PdfViewer
