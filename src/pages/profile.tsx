import { ProfileForm } from '@/components/profile';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileForm />
    </ProtectedRoute>
  );
} 