const randomRange = require("./");
const { promisify } = require("util");
const crypto = require("crypto");

const randomBytes = promisify(crypto.randomBytes);

const assert = require("assert");

const test = async () => {
  for (let i = 0; i < 100; i++) {
    const num = await randomRange(0, 10);
    assert.ok(num >= 0);
    assert.ok(num < 10);
  }
  for (let i = 0; i < 100; i++) {
    const num = await randomRange(0, 1000000);
    assert.ok(num >= 0);
    assert.ok(num < 1000000);
  }
  for (let i = 0; i < 100; i++) {
    const num = await randomRange(-10, 5);
    assert.ok(num >= -10);
    assert.ok(num < 5);
  }

  {
    const maxVal = Math.pow(2, 6 * 8) - 1;
    const bufs = [maxVal - 2, maxVal - 1, maxVal - 0, maxVal - 3].map(n => {
      const b = Buffer.allocUnsafe(6);
      b.writeUIntBE(n, 0, 6);
      return b;
    });
    let i = 0;
    const getBytes = async _ => {
      buf = bufs[i];
      i = i + 1;
      return buf;
    };

    // randomRange should request just 1 byte and reject all numbers in [253, 255] interval
    const num = await randomRange(0, 5, getBytes);
    // stops requesting bytes when 252 is picked
    assert.equal(i, 4);
    // console.log(num);
    assert.ok(num >= 0);
    assert.ok(num < 5);
  }
};

test();
