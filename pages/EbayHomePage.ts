import {expect, Page} from '@playwright/test'

export class EbayHomePage {
    constructor(private readonly page: Page) {}

    async open(): Promise <void> {
        await this.page.goto('/');
        await expect(this.page).toHaveTitle(/eBay/i);
    }

    async searchFor(searchTerm: string): Promise<void> {
        await this.page.locator('#gh-ac').fill(searchTerm);
        await this.page.locator('#gh-search-btn').click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}