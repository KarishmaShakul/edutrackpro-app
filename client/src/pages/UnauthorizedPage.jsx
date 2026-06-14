import { useNavigate } from 'react-router-dom';
export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-red-500">403</h1>
      <p className="text-gray-600">You are not authorized to view this page.</p>
      <button onClick={() => navigate(-1)}
        className="px-4 py-2 bg-primary text-white rounded-lg">
        Go Back
      </button>
    </div>
  );
}