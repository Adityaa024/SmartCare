import { createApi } from '@reduxjs/toolkit/query/react'
import { tagTypeList } from '../tag-types'
import { localBaseQuery } from '../../helpers/local/localBaseQuery'

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: localBaseQuery(),
    endpoints: () => ({}),
    tagTypes: tagTypeList
})