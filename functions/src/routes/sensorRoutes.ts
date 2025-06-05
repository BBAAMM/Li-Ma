import {Router, Request, Response, NextFunction} from "express";
import {saveSensorData} from "../services/sensorService";
import {SensorData} from "../types/sensor.d";

const router = Router();

/*
 * Post Sensor data
 * @call /api/postSensor
 * @return null
 */
router.post("/postSensor",
  async (req:Request<any, any, SensorData>,
    res: Response,
    next: NextFunction): Promise<void> =>{
    try {
      const data = req.body;
      if (
        typeof data.device !== "string" ||
        typeof data.temp !== "number" ||
        typeof data.hum !== "number" ||
        typeof data.patrol !== "boolean"
      ) {
        res.status(400).json({error: "Invalid payload"});
        return;
      }
      await saveSensorData(data);
      res.json({ok: true});
      return;
    } catch (err) {
      next(err);
      return;
    }
  });

export default router;
