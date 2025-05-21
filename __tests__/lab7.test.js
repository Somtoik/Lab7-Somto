describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    // give navigation up to 60s and wait until network idle
    await page.setDefaultNavigationTimeout(60000);
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/', {
      waitUntil: 'networkidle2'
    });
    // make sure our custom element is on the page
    await page.waitForSelector('product-item');
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');
    let allArePopulated = true;

    const prodItemsData = await page.$$eval('product-item', (prodItems) =>
      prodItems.map(item => {
        const data = item.data;
        if (!data.title || !data.price || !data.image) return false;
        return true;
      })
    );

    for (let i = 0; i < prodItemsData.length; i++) {
      if (!prodItemsData[i]) allArePopulated = false;
    }

    expect(allArePopulated).toBe(true);
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');
    const product = await page.$('product-item');
    const shadow = await product.getProperty('shadowRoot');
    const button = await shadow.$('button');

    await button.click();
    // small manual delay for the DOM update
    await new Promise(r => setTimeout(r, 100));

    const buttonText = await button.getProperty('innerText');
    const value = await buttonText.jsonValue();
    expect(value).toBe('Remove from Cart');
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');
    await page.waitForSelector('#cart-count');

    const prodItems = await page.$$('product-item');
    for (let i = 0; i < prodItems.length; i++) {
      const item = prodItems[i];
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      // only click if it's still "Add to Cart"
      if (text === 'Add to Cart') {
        await button.click();
        await new Promise(r => setTimeout(r, 50));
      }
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('20');

    /**
     **** TODO - STEP 3 **** 
     * Query select all of the <product-item> elements, then for every single product element
       get the shadowRoot and query select the button inside, and click on it.
     * Check to see if the innerText of #cart-count is 20
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  }, 20000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#cart-count');

    const prodItems = await page.$$('product-item');
    let allCorrect = true;

    for (let i = 0; i < prodItems.length; i++) {
      const item = prodItems[i];
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      if (text !== 'Remove from Cart') allCorrect = false;
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(allCorrect).toBe(true);
    expect(cartCount).toBe('20');

    /**
     **** TODO - STEP 4 **** 
     * Reload the page, then select all of the <product-item> elements, and check every
       element to make sure that all of their buttons say "Remove from Cart".
     * Also check to make sure that #cart-count is still 20
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  }, 20000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {
    await page.waitForFunction(() => localStorage.getItem('cart') !== null);
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');

    /**
     **** TODO - STEP 5 **** 
     * At this point the item 'cart' in localStorage should be 
       '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');
    await page.waitForSelector('#cart-count');

    const prodItems = await page.$$('product-item');
    for (let i = 0; i < prodItems.length; i++) {
      const item = prodItems[i];
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      // only click if it's "Remove from Cart"
      if (text === 'Remove from Cart') {
        await button.click();
        await new Promise(r => setTimeout(r, 50));
      }
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('0');

    /**
     **** TODO - STEP 6 **** 
     * Go through and click "Remove from Cart" on every single <product-item>, just like above.
     * Once you have, check to make sure that #cart-count is now 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  }, 20000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#cart-count');

    const prodItems = await page.$$('product-item');
    let allCorrect = true;

    for (let i = 0; i < prodItems.length; i++) {
      const item = prodItems[i];
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      if (text !== 'Add to Cart') allCorrect = false;
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(allCorrect).toBe(true);
    expect(cartCount).toBe('0');

    /**
     **** TODO - STEP 7 **** 
     * Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
       is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
     * Also check to make sure that #cart-count is still 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  }, 20000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    await page.waitForFunction(() => localStorage.getItem('cart') !== null);
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[]');

    /**
     **** TODO - STEP 8 **** 
     * At this point the item 'cart' in localStorage should be '[]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
  });
});
