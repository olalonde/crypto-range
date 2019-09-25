const { promisify } = require("util");
const crypto = require("crypto");

const defaultGetRandomBytes = promisify(crypto.randomBytes);

const MAX_VAL = Buffer.from("ffffffffffff", "hex").readUIntBE(0, 6);
// 2^(6*8) - 1

/**
 * Calculate a uniformly distributed random number less than bound
 * avoiding "modulo bias".
 *
 * Returns random int between [0..bound)
 */
async function internalRandomRange(
  bound,
  getRandomBytes = defaultGetRandomBytes
) {
  if (bound > MAX_VAL) throw new ArgumentError(`bound must be <= ${MAX_VAL}`);
  const range = bound - 1;
  const excess = MAX_VAL % range;
  const randLimit = MAX_VAL - excess;

  while (true) {
    const x = (await getRandomBytes(6)).readUIntBE(0, 6);
    // if x > (maxVal - (maxVal % range)), we will get "modulo bias", try a new number
    if (x > randLimit) continue;
    return x % range;
  }
}

/*
 *
 * @param min the least value returned
 * @param bound the upper bound (exclusive)
 *
 */
module.exports = async function(min, bound, getRandomBytes) {
  if (![min, bound].every(Number.isInteger))
    throw new ArgumentError("min and bound must be integers");
  if (min >= bound) {
    throw new ArgumentError("min must be >= bound");
  }
  const k = bound - min;
  const n = await internalRandomRange(k, getRandomBytes);
  return n + min;
};
