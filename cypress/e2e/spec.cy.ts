describe('E-commerce Flow', () => {
  it('should allow a user to navigate to the product page, add a product to the cart, and see the cart update', () => {
    // 1. Visit the homepage
    cy.visit('http://localhost:3000');

    // 2. Check for the main heading
    cy.get('h1').contains('Prémiové doplnky výživy');

    // 3. Find the link to the product and click it
    cy.get('a[href*="product"]').first().click();

    // 4. Verify the URL is now the product page
    cy.url().should('include', '/product');

    // 5. Check for the product title on the product page
    cy.get('h1').contains('Lipozomálny Vitamín C');

    // 6. Find the "Add to Cart" button and click it
    cy.get('button').contains('Pridať do košíka').click();

    // 7. Check if the cart indicator in the header now shows "1"
    cy.get('header').find('div').contains('1');
  });
});
