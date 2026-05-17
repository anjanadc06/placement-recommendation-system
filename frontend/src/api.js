import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getStudentsForRegister = () => API.get('/auth/students-list');

// Students
export const getStudents = () => API.get('/students/');
export const getStudent = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students/', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Companies
export const getCompanies = () => API.get('/companies/');
export const getCompany = (id) => API.get(`/companies/${id}`);
export const createCompany = (data) => API.post('/companies/', data);
export const updateCompany = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompany = (id) => API.delete(`/companies/${id}`);

// Jobs
export const getJobs = () => API.get('/jobs/');
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs/', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Applications
export const getApplications = () => API.get('/applications/');
export const createApplication = (data) => API.post('/applications/', data);
export const updateApplicationStatus = (id, data) => API.patch(`/applications/${id}/status`, data);
export const deleteApplication = (id) => API.delete(`/applications/${id}`);

// Recommendations
export const getRecommendations = () => API.get('/recommendations/');
export const getStudentRecommendations = (id) => API.get(`/recommendations/student/${id}`);
export const getEligibleJobs = (id) => API.get(`/recommendations/eligible/${id}`);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');
