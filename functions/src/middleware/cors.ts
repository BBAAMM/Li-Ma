import cors from "cors";

const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
