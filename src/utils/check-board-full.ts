import { BoardSchema } from '@/services/game/game.schema'

export function checkBoardFull(board: BoardSchema) {
  return board.every((row) => row.every((cell) => cell))
}
