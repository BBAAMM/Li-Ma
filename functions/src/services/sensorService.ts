import {db} from "../utils/firebase.js";
import {SensorData} from "../types/sensor.d";

/**
 * Post Sensor data to devices database.
 * @param {SensorData} data
 * @return {void}
 */
export async function saveSensorData(data: SensorData): Promise<void> {
  const {device, temp, hum, patrol} = data;
  await db
    .collection("devices")
    .doc(device)
    .set({temp, hum, patrol}, {merge: true});
}
