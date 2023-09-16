import { z } from 'zod'

export const Player = {
  PLAYER: 'PLAYER',
  AI: 'AI',
} as const
export type Player = (typeof Player)[keyof typeof Player]

const CellSchema = z
  .object({
    player: z.nativeEnum(Player),
    level: z.number().min(1).max(3),
  })
  .nullable()
export type CellSchema = z.infer<typeof CellSchema>

export const MoveSchema = z.object({
  player: z.nativeEnum(Player),
  level: z.number().min(1).max(3),
  col: z.number(),
  row: z.number(),
})
export type MoveSchema = z.infer<typeof MoveSchema>

const BoardRowSchema = z
  .array(CellSchema)
  .refine((rows) => rows.length === 3, { message: 'Board must have 3 rows' })
export type BoardRowSchema = z.infer<typeof BoardRowSchema>

export const BoardSchema = z
  .array(BoardRowSchema)
  .refine((rows) => rows.length === 3, { message: 'Board must have 3 rows' })
export type BoardSchema = z.infer<typeof BoardSchema>

export const PlayerState = z.object({
  remaining: z.object({
    level1: z.number().min(0),
    level2: z.number().min(0),
    level3: z.number().min(0),
  }),
})
export type PlayerState = z.infer<typeof PlayerState>

export const GameTableSchema = z.object({
  aiState: PlayerState,
  playerState: PlayerState,
  board: BoardSchema,
})
export type GameTableSchema = z.infer<typeof GameTableSchema>
