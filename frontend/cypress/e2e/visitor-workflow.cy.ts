describe("Visitor Management Workflow", () => {
    beforeEach(() => {
        // Visit the login page directly since Cypress clears state between tests
        cy.visit("/login");
        cy.get('input[type="email"]').type("admin@coseke.com");
        cy.get('input[type="password"]').type("Password123!");
        cy.get('button[type="submit"]').click();

        // Ensure we are redirected to the dashboard page
        cy.url().should("not.include", "/login");
    });

    it("should register a visitor and check them in", () => {
        // Navigate to registration page
        cy.contains("Register Visitor").click();
        cy.url().should("include", "/register");

        // Fill registration form
        cy.get("#fullName").type("Alice Johnson");
        cy.get("#purpose").type("Job Interview");

        // Submit form
        cy.contains("Register & Queue Visitor").click();

        // Should see success message
        cy.contains("Visitor registered successfully!").should("be.visible");

        // Go back to the reception dashboard
        cy.contains("Back to Reception Dashboard").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/");
        cy.contains("Alice Johnson").should("be.visible");

        // Check in the visitor
        cy.contains("Check in").click();

        // Status should change to "Inside"
        cy.contains("Inside").should("be.visible");
    });

    it("should display all registered visitors", () => {
        cy.get("table tbody tr").should("have.length.greaterThan", 0);

        // Verify table columns
        cy.contains("Visitor info").should("be.visible");
        cy.contains("Purpose").should("be.visible");
        cy.contains("Status").should("be.visible");
    });

    it("should check out a visitor", () => {
        // Find a checked-in visitor and check them out
        cy.contains("Check out").first().click();

        // Status should change to "Checked out" and Action cell should display "Completed"
        cy.contains("Checked out").should("be.visible");
        cy.contains("Completed").should("be.visible");
    });

    it("should show validation errors on registration", () => {
        cy.contains("Register Visitor").click();

        // Try to submit empty form
        cy.contains("Register & Queue Visitor").click();

        // Should show validation error
        cy.contains("is required").should("be.visible");
    });
});