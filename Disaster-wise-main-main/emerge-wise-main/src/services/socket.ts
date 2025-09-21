import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Emergency alerts
    this.socket.on('new_emergency_alert', (data) => {
      this.emit('new_emergency_alert', data);
    });

    this.socket.on('alert_updated', (data) => {
      this.emit('alert_updated', data);
    });

    // Incidents
    this.socket.on('high_severity_incident', (data) => {
      this.emit('high_severity_incident', data);
    });

    this.socket.on('new_incident_nearby', (data) => {
      this.emit('new_incident_nearby', data);
    });

    // Resources
    this.socket.on('resource_updated', (data) => {
      this.emit('resource_updated', data);
    });

    this.socket.on('capacity_warning', (data) => {
      this.emit('capacity_warning', data);
    });

    // Routes
    this.socket.on('route_status_updated', (data) => {
      this.emit('route_status_updated', data);
    });

    this.socket.on('traffic_updates', (data) => {
      this.emit('traffic_updates', data);
    });

    // Notifications
    this.socket.on('emergency_notification', (data) => {
      this.emit('emergency_notification', data);
    });

    this.socket.on('system_broadcast', (data) => {
      this.emit('system_broadcast', data);
    });

    // Dashboard updates
    this.socket.on('dashboard_data', (data) => {
      this.emit('dashboard_data', data);
    });

    this.socket.on('periodic_update', (data) => {
      this.emit('periodic_update', data);
    });

    // System status
    this.socket.on('system_status', (data) => {
      this.emit('system_status', data);
    });
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Socket emission methods
  joinLocation(location: string) {
    this.socket?.emit('join_location', location);
  }

  joinRole(role: string) {
    this.socket?.emit('join_role', role);
  }

  reportIncident(data: any) {
    this.socket?.emit('report_incident', data);
  }

  updateResourceStatus(data: any) {
    this.socket?.emit('update_resource_status', data);
  }

  updateRouteStatus(data: any) {
    this.socket?.emit('update_route_status', data);
  }

  createAlert(data: any) {
    this.socket?.emit('create_alert', data);
  }

  updateResponderLocation(data: any) {
    this.socket?.emit('update_responder_location', data);
  }

  sendCoordinationMessage(data: any) {
    this.socket?.emit('send_coordination_message', data);
  }

  requestDashboardData() {
    this.socket?.emit('request_dashboard_data');
  }
}

export const socketService = new SocketService();
