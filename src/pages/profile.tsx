import ProfileForm from '../components/ProfileForm';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
} 