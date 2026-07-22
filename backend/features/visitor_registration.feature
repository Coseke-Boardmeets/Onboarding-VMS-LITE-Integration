Feature: Visitor Registration
  As a receptionist
  I want to register new visitors
  So that I can track them in the system

  Background:
    Given the registration API is available

  Scenario: Register a visitor successfully
    When I register a visitor with:
      | fullName | purpose      |
      | John Doe | Job Interview |
    Then the visitor should be created with status "PENDING"
    And the response status should be 201

  Scenario: Reject registration without fullName
    When I try to register a visitor with:
      | purpose |
      | Meeting |
    Then the response status should be 400
    And the error should contain "fullName is required"

  Scenario: Reject registration with short fullName
    When I try to register a visitor with:
      | fullName | purpose |
      | J        | Meeting |
    Then the response status should be 400
    And the error should contain "at least 2 characters"

  Scenario: Retrieve all registered visitors
    Given 3 visitors are already registered
    When I fetch all visitors
    Then I should receive a list of visitors
    And the list should have 3 visitors