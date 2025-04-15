import ProfileForm from '@/components/profile/ProfileForm';
import { ProtectedRoute } from '@/components/common/ProtectedRoute/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
} 