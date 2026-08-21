// =============================================================================
// Persona Routes
// RESTful endpoints for managing user brand personas and RAG queries.
// =============================================================================

import { Router } from 'express';
import { listPersonas, createPersona, deletePersona, queryPersona } from '../controllers/personaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /api/personas — List all personas for the user
router.get('/', authMiddleware, listPersonas);

// POST /api/personas — Create a new persona (optionally with training text)
router.post('/', authMiddleware, createPersona);

// DELETE /api/personas/:id — Delete a persona
router.delete('/:id', authMiddleware, deletePersona);

// POST /api/personas/:id/query — RAG similarity search against a persona
router.post('/:id/query', authMiddleware, queryPersona);

export default router;
