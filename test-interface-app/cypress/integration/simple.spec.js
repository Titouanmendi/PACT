describe('Interface tests', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('Check if online', () => {
    // beforeEach
  });

  it('Text input', () => {
    cy.contains("Identité - papiers - citoyenneté").click();
    cy.contains("Généralités").click();
    cy.wait(500);
    cy.get('input').first().type('Welcome');
  });

  it('Add file', () => {
    cy.contains("Logement").click();
    cy.contains("Résidence principale").click();
    cy.wait(500);
    cy.fixture('temp.txt').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'testPicture.png',
        mimeType: 'image/png'
      });
    });
  })
})
