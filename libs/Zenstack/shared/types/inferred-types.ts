// Generated types
import type { Required } from 'utility-types'

import type {
  Post,
  User,
} from './models'

export type PostFull = Partial<Required<Post, 'id'>> & {
  author?: Partial<Required<UserFull, 'id'>>
}

export type UserFull = Partial<Required<User, 'id'>> & {
  posts?: Partial<Required<PostFull, 'id'>>[]
}
