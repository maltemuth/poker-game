/**
 * Where the button goes for the next hand (decision 0007): to the next seat,
 * clockwise from the last hand's button, whose player is in the game,
 * skipping empty seats and players who sit out or wait. The first hand's
 * button is the first such seat.
 */

/**
 * @param previous - Index of the last hand's button seat, or null
 * @param playing - Indices of the seats in the game, in seat order
 * @param seatCount - The table's number of seats
 */
export const nextButton = (
  previous: number | null,
  playing: number[],
  seatCount: number
): number => {
  if (playing.length === 0) throw new Error("No one is playing");
  if (previous === null) return playing[0];
  for (let step = 1; step <= seatCount; step++) {
    const seat = (previous + step) % seatCount;
    if (playing.includes(seat)) return seat;
  }
  return playing[0];
};
