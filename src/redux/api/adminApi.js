import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi"

const ADMIN_URL = '/admin'

export const adminApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAdminStats: build.query({
            query: () => ({
                url: `${ADMIN_URL}/stats`,
                method: 'GET'
            }),
            providesTags: [tagTypes.admin]
        }),
        getAllAppointments: build.query({
            query: (arg) => ({
                url: `/appointment`,
                method: 'GET',
                params: arg
            }),
            transformResponse: (response) => ({
                appointments: Array.isArray(response) ? response : response?.data || [],
                meta: Array.isArray(response) ? {} : response?.meta || {}
            }),
            providesTags: [tagTypes.appointments]
        }),
        getAllPatients: build.query({
            query: (arg) => ({
                url: `/patient`,
                method: 'GET',
                params: arg
            }),
            transformResponse: (response) => ({
                patients: Array.isArray(response) ? response : response?.data || [],
                meta: Array.isArray(response) ? {} : response?.meta || {}
            }),
            providesTags: [tagTypes.patient]
        }),
    })
})

export const { 
    useGetAdminStatsQuery,
    useGetAllAppointmentsQuery,
    useGetAllPatientsQuery
} = adminApi;

export { useUpdateAppointmentMutation } from './appointmentApi';
