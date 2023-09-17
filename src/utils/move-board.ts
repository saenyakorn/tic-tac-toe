import { BoardSchema, MoveSchema, PlayerState } from '@/services/game/game.schema'
import { deepClone } from './deep-clone'

export function moveBoard(_board: BoardSchema, move: MoveSchema, _state: PlayerState) {
  const board = deepClone(_board)
  const state = deepClone(_state)
  board[move.row][move.col] = { player: move.player, level: move.level }
  state.remaining[`level${move.level}` as keyof PlayerState['remaining']] -= 1
  return { board, state }
}
