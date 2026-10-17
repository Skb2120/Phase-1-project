import { getCanMessages } from '@/services/canService';
import { getFaults } from '@/services/faultService';
import { getNodes } from '@/services/nodeService';
import { getSensorReadings } from '@/services/sensorService';
import { getSystemEvents } from '@/services/eventService';
import { getTaskAssignments } from '@/services/taskService';

export const dataService = {
  getNodes,
  getSensorReadings,
  getCanMessages,
  getFaults,
  getTaskAssignments,
  getSystemEvents,
};
