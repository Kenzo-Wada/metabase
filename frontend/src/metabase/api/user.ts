import type {
  CreateUserRequest,
  ListUsersRequest,
  ListUsersResponse,
  UpdatePasswordRequest,
  UpdateUserRequest,
  User,
  UserId,
} from "metabase-types/api";

import { Api } from "./api";
import {
  idTag,
  invalidateTags,
  listTag,
  provideUserListTags,
  provideUserTags,
} from "./tags";

export const userApi = Api.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<ListUsersResponse, ListUsersRequest>({
      query: (params) => ({
        method: "GET",
        url: "/api/user",
        params,
      }),
      providesTags: (response) =>
        response ? provideUserListTags(response.data) : [],
    }),
    listUserRecipients: builder.query<ListUsersResponse, void>({
      query: () => ({
        method: "GET",
        url: "/api/user/recipients",
      }),
      providesTags: (response) =>
        response ? provideUserListTags(response.data) : [],
    }),
    getUser: builder.query<User, UserId>({
      query: (id) => ({
        method: "GET",
        url: `/api/user/${id}`,
      }),
      providesTags: (user) => (user ? provideUserTags(user) : []),
    }),
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        method: "POST",
        url: "/api/user",
        body,
      }),
      invalidatesTags: (_, error) => invalidateTags(error, [listTag("user")]),
      onQueryStarted: async (_request, { dispatch, queryFulfilled }) => {
        const { data: user } = await queryFulfilled;
        // entity framework compatibility
        dispatch({
          type: "metabase/entities/users/CREATE",
          payload: { user },
        });
      },
    }),
    updatePassword: builder.mutation<void, UpdatePasswordRequest>({
      query: ({ id, old_password, password }) => ({
        method: "PUT",
        url: `/api/user/${id}/password`,
        body: { old_password, password },
      }),
      invalidatesTags: (_, error, { id }) =>
        invalidateTags(error, [listTag("user"), idTag("user", id)]),
    }),
    deactivateUser: builder.mutation<void, UserId>({
      query: (id) => ({
        method: "DELETE",
        url: `/api/user/${id}`,
      }),
      invalidatesTags: (_, error, id) =>
        invalidateTags(error, [listTag("user"), idTag("user", id)]),
    }),
    reactivateUser: builder.mutation<User, UserId>({
      query: (id) => ({
        method: "PUT",
        url: `/api/user/${id}/reactivate`,
      }),
      invalidatesTags: (_, error, id) =>
        invalidateTags(error, [listTag("user"), idTag("user", id)]),
    }),
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...body }) => ({
        method: "PUT",
        url: `/api/user/${id}`,
        body,
      }),
      invalidatesTags: (_, error, { id }) =>
        invalidateTags(error, [listTag("user"), idTag("user", id)]),
      onQueryStarted: async (_request, { dispatch, queryFulfilled }) => {
        const { data: user } = await queryFulfilled;
        // entity framework compatibility
        dispatch({
          type: "metabase/entities/users/UPDATE",
          payload: { user },
        });
      },
    }),
  }),
});

export const {
  useListUsersQuery,
  useListUserRecipientsQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdatePasswordMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useUpdateUserMutation,
} = userApi;
