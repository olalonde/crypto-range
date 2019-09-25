const { promisify } = require("util");
const crypto = require("crypto");

const defaultGetRandomBytes = promisify(crypto.randomBytes);

// 6 bytes buffer
const buf6 = Buffer.from("ffffffffffff", "hex");
// precompute max bounds for x bytes
const maxBounds = [1, 2, 3, 4, 5, 6].map(b => [b, buf6.readUIntBE(0, b)]);
// 2^(6*8) - 1

const getMinBytes = n => {
  for ([bytes, maxVal] of maxBounds) {
    if (n <= maxVal) return [bytes, maxVal];
  }
  throw new ArgumentError(`bound must be <= ${maxBound}`);
};

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
  const range = bound - 1;
  const [minBytes, maxVal] = getMinBytes(range);
  const excess = maxVal % range;
  const randLimit = maxVal - excess;

  while (true) {
    const x = (await getRandomBytes(minBytes)).readUIntBE(0, minBytes);
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
