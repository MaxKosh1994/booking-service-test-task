import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import spec from './openapi.js';

const router = Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(spec));

export default router;
