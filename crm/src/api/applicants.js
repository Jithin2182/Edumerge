import client from './client';
export const getApplicants = () => client.get('/applicants');
export const getApplicantById = (id) => client.get(`/applicants/${id}`);
export const createApplicant = (data) => client.post('/applicants', data);
export const updateApplicant = (id, data) => client.put(`/applicants/${id}`, data);
export const updateFeeStatus = (id, data) => client.patch(`/applicants/${id}/fee-status`, data);
export const deleteApplicant = (id) => client.delete(`/applicants/${id}`);
