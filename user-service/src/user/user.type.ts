import type { TBlockedUserFullInfo, TUser, TUserWithProfile } from '@/utils/entities/user.entity'
import type { FindUserWithProfileByIdResponse, GetUserByEmailResponse } from 'protos/generated/user'

export type TUserId = TUser['id']

export type TCreateUserParams = {
  email: string
  password: string
  fullName: string
  birthday: Date
}

export type TSearchProfilesData = {
  id: number
  User: {
    id: number
    email: string
  }
  fullName: string
  avatar: string | null
}

export type TSearchUsersData = {
  id: number
  email: string
  Profile: {
    id: number
    fullName: string
    avatar: string | null
  } | null
}

export type TFindUserWithProfileByIdGrpcRes = FindUserWithProfileByIdResponse

export type TGetUserByEmailGrpcRes = GetUserByEmailResponse

export type TFindByIdGrpcRes = { user: TUser | null }

export type TFindUsersForGlobalSearchGrpcRes = { users: TUserWithProfile[] }

export type TCheckBlockedUserGrpcRes = {
  blockedUser: TBlockedUserFullInfo | null
}

export type TRegisterRes = {
  jwt_token: string
}
