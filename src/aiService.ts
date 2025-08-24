import { GoogleGenAI } from '@google/genai';
import {
  DEFAULT_MODEL,
  EXTENSION_NAME
} from './constants';
import {
  AiProviderNotImplementedError,
  UnexpectedApiResponseFormatError
} from './errors';

export interface AiCommitMessageGenerator {
  generateCommitMessage(diff: string, apiKey: string, provider: string): Promise<string>;
}

export class CommitMessageGenerator implements AiCommitMessageGenerator {
  async generateCommitMessage(diff: string, apiKey: string, provider: string): Promise<string> {
    const prompt = this.createPrompt(diff);

    if (provider === "gemini") {
      const genAI = new GoogleGenAI({
        apiKey: apiKey,
      });

      const response = await genAI.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });

      if (response && response.text) {
        let commitMessage: string = response.text.trim();
        commitMessage = commitMessage.replace(/^["']|["']$/g, "");
        return commitMessage;
      }

      throw new UnexpectedApiResponseFormatError();
    } else {
      throw new AiProviderNotImplementedError(provider);
    }
  }

  private createPrompt(diff: string): string {
    return `Generate a detailed, informative git commit message for the following changes. Follow conventional commit format. The commit message should consist of a subject line (type: subject) followed by a blank line and then a body with bullet points describing the changes.

Examples of good commit messages:

refactor(discount): Use job for materialized view refresh instead of triggers

This refactoring changes the mechanism for refreshing the \`discount_items\` materialized view from database triggers to a Laravel job. This provides more control and flexibility over the refresh process, improving maintainability and potentially performance.

- **Removed database triggers**: The \`createRefreshFunctionAndTrigger\` and associated trigger drops have been removed from the migration.
- **Introduced \`DiscountItemMaterializedViewRefreshJob\`**: A new job is responsible for concurrently refreshing the \`discount_items\` materialized view.
- **Integrated job dispatching**: The \`DiscountItemMaterializedViewRefreshJob\` is now dispatched from \`DiscountStoreController\`, \`DiscountUpdateController\`, and \`DiscountStatusUpdateController\` whenever a discount is created, updated, or its status is changed. This ensures the materialized view remains up-to-date through the application layer.

fix(discount): Refine product filtering and selection for discounts

This commit introduces several improvements to the product filtering and selection mechanisms within the discount management feature, enhancing accuracy and user experience.

- **Granular product filtering**: Refactored \`ProductRepository.php\` to allow explicit filtering of products based on \`stock_greater_than\` and \`price_greater_than\` criteria, providing more precise control over product eligibility for discounts.
- **Accurate "Select All"**: Ensured that "Select All" operations in discount creation/editing forms (\`DiscountApplyOn.vue\`, \`EditDiscountApplyOn.vue\`) only include products that are in stock and have a valid retail price.
- **Improved UX for suggestions**: Added \`pushState\` to prevent full page reloads when fetching suggestions in \`EditDiscountApplyOn.vue\`.
- **Bug Fix**: Corrected a typo in \`Product.vue\` to ensure accurate comparison of discount IDs when checking if a product is already in another discount.

feat(report): Exclude rewarded items from top-selling variants report

This commit refines the "top-selling variants" report by excluding items that were given as rewards or freebies. This ensures that the report accurately reflects genuinely sold products and provides more meaningful insights into sales performance.

- **Modified \`sale_overview\` materialized view**: Added an \`is_rewarded\` column to the \`sale_overview\` materialized view, derived from the \`meta_data\` of order items. This flag identifies products that were part of a reward or gift.
- **Updated \`ProductRepository\`**: Applied a \`where('is_rewarded', false)\` filter to the \`topSellingVariants\` query, ensuring that only non-rewarded items are considered when calculating top-selling products.

Guidelines:
- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Start with a subject line (type: subject)
- Follow with a blank line and a body explaining the changes with bullet points
- Focus on the "what" and "why" not the "how"
- Be detailed but concise

Changes:
${diff}

Commit message:`;
  }
}