import client from './client';
export const getPrograms = () => client.get('/programs');
export const getProgramById = (id) => client.get(`/programs/${id}`);
export const createProgram = (data) => client.post('/programs', data);
