import { GameTableSchema } from '@/services/game/game.schema'
import { gameService } from '@/services/game/game.service'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const currentGameState = GameTableSchema.parse(await request.json())
  const nextGameState = await gameService.aiRespond(currentGameState)
  return NextResponse.json(nextGameState)
}
