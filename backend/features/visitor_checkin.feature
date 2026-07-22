Feature: Visitor Check-In and Check-Out
  As a receptionist
  I want to check visitors in and out
  So that I can track their time in the office

  Background:
    Given a visitor exists with status "PENDING"

  Scenario: Check in a visitor successfully
    When I check in the visitor
    Then the visitor status should be "CHECKED_IN"
    And the response status should be 200
    And the timeIn field should be recorded

  Scenario: Check out a visitor successfully
    Given the visitor is already checked in
    When I check out the visitor
    Then the visitor status should be "CHECKED_OUT"
    And the response status should be 200
    And the timeOut field should be recorded

  Scenario: Cannot check in non-existent visitor
    When I try to check in visitor with id "invalid-id"
    Then the response status should be 404
    And the error should contain "Visitor not found"

  Scenario: Complete visitor workflow
    When I check in the visitor
    Then the visitor status should be "CHECKED_IN"
    When I check out the visitor
    Then the visitor status should be "CHECKED_OUT"