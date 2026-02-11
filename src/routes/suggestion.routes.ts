import { Hono } from 'hono';
import { getSuggestionsController } from '../controllers/suggestion.controller';

const suggestionRoutes = new Hono();

// Definimos la ruta raíz de este grupo
suggestionRoutes.post('/', getSuggestionsController);

export default suggestionRoutes;
