// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { GuildData, UserData } from 'cordo'
import { UserData as CustomUserData } from '../lib/users/user-data'
import { uildData as CustomGuildData } from '../lib/guild-data'


declare module 'cordo' {
  interface GuildData extends CustomGuildData { }
  interface UserData extends CustomUserData { }
}
