'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-accent text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 