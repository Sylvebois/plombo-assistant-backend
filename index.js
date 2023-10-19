import server from './server.js';
import { PORT } from './utils/config.js';
import { info } from './utils/logger.js';

server.listen(PORT, () => info(`Server running on port ${PORT}`));