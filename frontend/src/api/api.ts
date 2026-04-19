import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';

import Cookies from 'js-cookie';
import { Tag } from './tag-types';
import { resetUser } from '@/domains/auth/slice';

//ensure env is defined
const baseUrl = `${import.meta.env.VITE_API_URL}/api/v1`;

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const csrfToken = Cookies.get('csrfToken');

    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    headers.set('Content-Type', 'application/json');

    return headers;
  }
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(resetUser());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(Tag),
  endpoints: () => ({})
});