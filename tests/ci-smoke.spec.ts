import { expect, test } from "@playwright/test";

test.describe("CI smoke test", () => {
	test("should verify Playwright runs successfully in CI", async ({ page }) => {
		await page.setContent(`
			<html>
				<head>
					<title>Playwright CI Smoke Test</title>
				</head>
				<body>
					<h1>Playwright is working</h1>
					<button>Test button</button>
				</body>
			</html>
		`);

		await expect(page).toHaveTitle("Playwright CI Smoke Test");
		await expect(
			page.getByRole("heading", { name: "Playwright is working" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Test button" }),
		).toBeVisible();
	});
});
