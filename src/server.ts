import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const { PORT } = env;

app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
