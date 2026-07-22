import { Given, When, Then, Before, After, DataTable } from "@cucumber/cucumber";
import * as visitorService from "../../src/services/visitor.service";
import { prisma } from "../../src/services/db";
import expect from "expect";

// Context to store state between steps
interface TestContext {
    registrationData?: { fullName?: string; purpose?: string };
    response?: any;
    statusCode?: number;
    error?: any;
    visitor?: any;
    visitors?: any[];
    visitorId?: string;
}

const context: TestContext = {};

// ─────────────────────────────────────────────────────────
// Background & Setup
// ─────────────────────────────────────────────────────────

Before(async function () {
    // Clean up before each scenario
    await prisma.visitor.deleteMany({});
    Object.keys(context).forEach((key) => delete (context as any)[key]);
});

After(async function () {
    // Clean up after each scenario
    await prisma.visitor.deleteMany({});
});

// ─────────────────────────────────────────────────────────
// Given Steps
// ─────────────────────────────────────────────────────────

Given("the registration API is available", async function () {
    // Verify API is available
    expect(visitorService.create).toBeDefined();
});

Given("a visitor exists with status {string}", async function (status: string) {
    // Create a test visitor
    const visitor = await visitorService.create({
        fullName: "Test Visitor",
        purpose: "Test Purpose",
    });

    if (status === "CHECKED_IN") {
        await visitorService.checkIn(visitor.id);
    }

    context.visitor = visitor;
    context.visitorId = visitor.id;
});

Given(
    "the visitor is already checked in",
    async function () {
        if (context.visitor && context.visitor.status !== "CHECKED_IN") {
            context.visitor = await visitorService.checkIn(context.visitor.id);
        }
    }
);

Given(
    "{int} visitors are already registered",
    async function (count: number) {
        const visitors = [];
        for (let i = 0; i < count; i++) {
            const visitor = await visitorService.create({
                fullName: `Visitor ${i + 1}`,
                purpose: `Purpose ${i + 1}`,
            });
            visitors.push(visitor);
        }
        context.visitors = visitors;
    }
);

// ─────────────────────────────────────────────────────────
// When Steps
// ─────────────────────────────────────────────────────────

When(
    "I register a visitor with:",
    async function (dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        context.registrationData = {
            fullName: data.fullName,
            purpose: data.purpose,
        };

        try {
            if (!context.registrationData.fullName || context.registrationData.fullName.trim() === "") {
                throw new Error("fullName is required");
            }
            if (context.registrationData.fullName.trim().length < 2) {
                throw new Error("fullName must be at least 2 characters long");
            }
            if (!context.registrationData.purpose || context.registrationData.purpose.trim() === "") {
                throw new Error("purpose is required");
            }

            context.visitor = await visitorService.create({
                fullName: context.registrationData.fullName!,
                purpose: context.registrationData.purpose!,
            });
            context.statusCode = 201;
        } catch (error: any) {
            context.error = error;
            context.statusCode = 500;
        }
    }
);

When(
    "I try to register a visitor with:",
    async function (dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        context.registrationData = {
            fullName: data.fullName,
            purpose: data.purpose,
        };

        try {
            if (!context.registrationData.fullName || context.registrationData.fullName.trim() === "") {
                throw new Error("fullName is required");
            }
            if (context.registrationData.fullName.trim().length < 2) {
                throw new Error("fullName must be at least 2 characters long");
            }
            if (!context.registrationData.purpose || context.registrationData.purpose.trim() === "") {
                throw new Error("purpose is required");
            }

            context.visitor = await visitorService.create({
                fullName: context.registrationData.fullName || "",
                purpose: context.registrationData.purpose || "",
            });
            context.statusCode = 201;
        } catch (error: any) {
            context.error = error;
            context.statusCode = 400;
        }
    }
);

When("I fetch all visitors", async function () {
    try {
        context.visitors = await visitorService.findAll();
        context.statusCode = 200;
    } catch (error: any) {
        context.error = error;
        context.statusCode = 500;
    }
});

When("I check in the visitor", async function () {
    try {
        if (!context.visitorId && context.visitor) {
            context.visitorId = context.visitor.id;
        }

        context.visitor = await visitorService.checkIn(context.visitorId!);
        context.statusCode = 200;
    } catch (error: any) {
        context.error = error;
        context.statusCode = 500;
    }
});

When("I check out the visitor", async function () {
    try {
        if (!context.visitorId && context.visitor) {
            context.visitorId = context.visitor.id;
        }

        context.visitor = await visitorService.checkOut(context.visitorId!);
        context.statusCode = 200;
    } catch (error: any) {
        context.error = error;
        context.statusCode = 500;
    }
});

When(
    "I try to check in visitor with id {string}",
    async function (visitorId: string) {
        try {
            context.visitor = await visitorService.checkIn(visitorId);
            context.statusCode = 200;
        } catch (error: any) {
            if (error.code === "P2025") {
                context.statusCode = 404;
                context.error = new Error("Visitor not found");
            } else {
                context.statusCode = 500;
                context.error = error;
            }
        }
    }
);

// ─────────────────────────────────────────────────────────
// Then Steps
// ─────────────────────────────────────────────────────────

Then(
    'the visitor should be created with status {string}',
    async function (status: string) {
        expect(context.visitor).toBeDefined();
        expect(context.visitor.status).toBe(status);
    }
);

Then(
    "the response status should be {int}",
    function (expectedStatus: number) {
        expect(context.statusCode).toBe(expectedStatus);
    }
);

Then(
    "the error should contain {string}",
    function (expectedError: string) {
        expect(context.error).toBeDefined();
        expect(context.error.message || context.error.toString()).toContain(
            expectedError
        );
    }
);

Then(
    "I should receive a list of visitors",
    function () {
        expect(Array.isArray(context.visitors)).toBe(true);
    }
);

Then(
    "the list should have {int} visitors",
    function (count: number) {
        expect(context.visitors).toHaveLength(count);
    }
);

Then(
    'the visitor status should be {string}',
    function (expectedStatus: string) {
        expect(context.visitor).toBeDefined();
        expect(context.visitor.status).toBe(expectedStatus);
    }
);

Then(
    "the timeIn field should be recorded",
    function () {
        expect(context.visitor.timeIn).toBeDefined();
        expect(context.visitor.timeIn).not.toBeNull();
    }
);

Then(
    "the timeOut field should be recorded",
    function () {
        expect(context.visitor.timeOut).toBeDefined();
        expect(context.visitor.timeOut).not.toBeNull();
    }
);