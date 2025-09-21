import { useEffect } from 'react';
import { socketService } from '@/services/socket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const SocketConnection = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to socket when user is authenticated
      socketService.connect();

      // Join appropriate rooms based on user profile
      if (user.user_metadata?.role) {
        socketService.joinRole(user.user_metadata.role);
      }

      // Set up global notification handlers
      const handleEmergencyNotification = (data: any) => {
        toast.error(data.title, {
          description: data.message,
          duration: 10000,
        });
      };

      const handleSystemBroadcast = (data: any) => {
        toast.warning('System Broadcast', {
          description: data.message,
          duration: 15000,
        });
      };

      socketService.on('emergency_notification', handleEmergencyNotification);
      socketService.on('system_broadcast', handleSystemBroadcast);

      return () => {
        socketService.off('emergency_notification', handleEmergencyNotification);
        socketService.off('system_broadcast', handleSystemBroadcast);
        socketService.disconnect();
      };
    }
  }, [user]);

  return null; // This component doesn't render anything
};

export default SocketConnection;
