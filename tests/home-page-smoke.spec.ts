import { test } from "@playwright/test";
import { EbayHomePage } from "../pages/EbayHomePage";

test("should open eBay home page and search for headphones", async ({
	page,
}) => {
	const homePage = new EbayHomePage(page);

	await homePage.open();
	await homePage.searchFor("Headphones");
});
