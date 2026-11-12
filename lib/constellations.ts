/**
 * The twelve raasi as the figures people draw between their stars.
 *
 * These are the familiar stick figures — the Scorpion's hook, the Archer's
 * teapot, the Lion's sickle — laid out by hand in a 100×100 box, with each
 * star's brightness roughly as it is in the sky (1 is brightest). They are
 * drawn to be recognised, not to be measured: near enough to the true figure
 * that someone who knows the sky will know it, and no claim beyond that.
 *
 * In the order of the zodiac, Mesham (Aries) first, to match `RAASIS`.
 */
export interface ConstellationFigure {
  /** [x, y, magnitude 1–3] — y runs down the page. */
  stars: readonly (readonly [number, number, 1 | 2 | 3])[];
  /** Pairs of indices into `stars`, in the order the figure is drawn. */
  lines: readonly (readonly [number, number])[];
}

export const RAASI_FIGURES: readonly ConstellationFigure[] = [
  // Mesham — the Ram: a short bent line from Hamal
  {
    stars: [[40, 40, 1], [27, 48, 2], [22, 55, 3], [80, 30, 3]],
    lines: [[3, 0], [0, 1], [1, 2]],
  },
  // Rishabam — the Bull: the V of the Hyades, two long horns
  {
    stars: [
      [52, 58, 1], [64, 65, 3], [58, 48, 2], [18, 14, 1],
      [12, 40, 2], [82, 76, 3], [80, 32, 2], [60, 57, 3],
    ],
    lines: [[1, 0], [0, 4], [1, 7], [7, 2], [2, 3], [1, 5]],
  },
  // Mithunam — the Twins: two figures side by side from Castor and Pollux
  {
    stars: [
      [30, 14, 1], [16, 26, 1], [42, 26, 3], [58, 36, 2], [74, 44, 2],
      [84, 47, 3], [34, 48, 2], [48, 58, 3], [66, 74, 1],
    ],
    lines: [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 7], [7, 8]],
  },
  // Kadagam — the Crab: an upturned Y
  {
    stars: [[50, 12, 3], [50, 42, 3], [52, 55, 2], [24, 84, 3], [80, 82, 2]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4]],
  },
  // Simmam — the Lion: the sickle of the mane, the triangle of the haunch
  {
    stars: [
      [72, 70, 1], [70, 54, 3], [62, 42, 1], [64, 28, 2], [76, 18, 3],
      [86, 26, 2], [28, 40, 2], [30, 58, 2], [8, 62, 1],
    ],
    lines: [[5, 4], [4, 3], [3, 2], [2, 1], [1, 0], [0, 7], [7, 8], [8, 6], [6, 2], [6, 7]],
  },
  // Kanni — the Maiden: a long reclining figure ending in Spica
  {
    stars: [
      [44, 82, 1], [58, 50, 2], [42, 40, 2], [32, 22, 2], [88, 42, 2],
      [72, 48, 3], [28, 56, 2], [10, 52, 3], [50, 66, 3],
    ],
    lines: [[4, 5], [5, 1], [1, 2], [2, 3], [1, 8], [8, 0], [2, 6], [6, 7], [0, 6]],
  },
  // Thulam — the Scales: a triangle with two hanging pans
  {
    stars: [[62, 54, 1], [46, 22, 1], [24, 44, 2], [66, 84, 2], [22, 80, 3]],
    lines: [[0, 1], [1, 2], [2, 0], [0, 3], [2, 4]],
  },
  // Viruchigam — the Scorpion: claws, the red heart, and the curling tail
  {
    stars: [
      [84, 14, 2], [88, 26, 1], [86, 40, 2], [72, 30, 3], [64, 36, 1],
      [58, 44, 3], [48, 60, 2], [44, 72, 2], [42, 84, 3], [30, 90, 3],
      [16, 86, 2], [10, 76, 3], [14, 68, 2], [20, 62, 1],
    ],
    lines: [
      [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7],
      [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
    ],
  },
  // Dhanusu — the Archer: the teapot
  {
    stars: [
      [58, 74, 1], [60, 52, 2], [56, 32, 2], [38, 44, 2],
      [26, 36, 1], [18, 54, 3], [32, 66, 2], [74, 56, 2],
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
      [1, 7], [7, 0], [3, 6], [1, 3],
    ],
  },
  // Magaram — the Sea-goat: a wide, lopsided triangle
  {
    stars: [
      [86, 18, 2], [82, 30, 2], [66, 62, 3], [62, 76, 3], [36, 66, 3],
      [10, 42, 1], [18, 42, 2], [34, 40, 3], [50, 38, 3],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 1]],
  },
  // Kumbam — the Water-bearer: the jar, and the stream poured from it
  {
    stars: [
      [92, 56, 3], [74, 44, 1], [52, 28, 1], [38, 30, 2], [32, 28, 3], [26, 32, 3],
      [34, 20, 3], [44, 50, 3], [28, 56, 2], [20, 66, 3], [12, 76, 3], [24, 84, 2],
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6],
      [2, 7], [7, 8], [8, 9], [9, 10], [8, 11],
    ],
  },
  // Meenam — the Fishes: two lines meeting at the knot, a ring for one fish
  {
    stars: [
      [14, 84, 2], [30, 78, 3], [46, 70, 3], [58, 66, 3], [72, 60, 3],
      [82, 56, 2], [90, 60, 3], [92, 68, 2], [86, 74, 3], [78, 70, 3],
      [20, 66, 3], [24, 46, 1], [20, 28, 3], [16, 14, 3], [27, 16, 3],
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
      [0, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 12],
    ],
  },
];
