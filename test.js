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

  /*
  {
    const memo = [];
    const getBytes = async i => {
      const bytes = await randomBytes(i);
      memo.push(bytes);
      return bytes;
    };
    const num = await randomRange(0, 1000000, getBytes);
    console.log(memo);
    assert.ok(num >= 0);
    assert.ok(num < 5);
  }
  */

  {
    const bufs = [253, 254, 255, 252].map(n =>
      Buffer.from(new Uint32Array([n]))
    );
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
