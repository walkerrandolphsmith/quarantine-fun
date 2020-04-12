export const errorsByCode = {
    0: { message: 'Somone already choose that name', field: 'name' },
    1: { message: 'Invalid GAME CODE', field: 'gameCode' },
    2: { message: 'This game has already started', field: 'gameCode' },
    3: { message: 'Can\'t find that game', field: 'gameCode' },
    4: { message: 'Requires at least two players', field: 'startGame' },
    7: { message: 'Failed to start game', field: 'startGame' }
}