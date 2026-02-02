'use server';
/**
 * @fileOverview This file contains a Genkit flow for flagging anomalous contribution patterns.
 *
 * The flow analyzes a member's contribution history and flags any unusual deviations from their typical contribution behavior.
 * It exports the flagAnomalousContributions function, the FlagAnomalousContributionsInput type, and the FlagAnomalousContributionsOutput type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagAnomalousContributionsInputSchema = z.object({
  memberId: z.string().describe('The unique identifier of the member.'),
  contributionHistory: z
    .array(z.object({
      date: z.string().describe('The date of the contribution (YYYY-MM-DD).'),
      amount: z.number().describe('The contribution amount.'),
    }))
    .describe('The contribution history of the member.'),
  threshold: z
    .number()
    .default(2.0)
    .describe(
      'The threshold (in standard deviations) above which a contribution is considered anomalous. Defaults to 2.0.'
    ),
});
export type FlagAnomalousContributionsInput = z.infer<typeof FlagAnomalousContributionsInputSchema>;

const FlagAnomalousContributionsOutputSchema = z.object({
  isAnomalous: z
    .boolean()
    .describe('Whether the latest contribution is considered anomalous.'),
  reason: z
    .string()
    .optional()
    .describe('The reason why the contribution is considered anomalous.'),
});
export type FlagAnomalousContributionsOutput = z.infer<typeof FlagAnomalousContributionsOutputSchema>;

export async function flagAnomalousContributions(
  input: FlagAnomalousContributionsInput
): Promise<FlagAnomalousContributionsOutput> {
  return flagAnomalousContributionsFlow(input);
}

const flagAnomalousContributionsPrompt = ai.definePrompt({
  name: 'flagAnomalousContributionsPrompt',
  input: {schema: FlagAnomalousContributionsInputSchema},
  output: {schema: FlagAnomalousContributionsOutputSchema},
  prompt: `You are an expert in financial anomaly detection.  Given the following member contribution history, determine if the most recent contribution is anomalous.

Member ID: {{{memberId}}}
Contribution History:
{{#each contributionHistory}}
- Date: {{{date}}}, Amount: {{{amount}}}
{{/each}}

A contribution is considered anomalous if it deviates from the historical average by more than {{{threshold}}} standard deviations.

Consider factors such as seasonality and trends in the contribution history.

Return a JSON object indicating whether the latest contribution is anomalous and the reasoning behind your determination.`,
});

const flagAnomalousContributionsFlow = ai.defineFlow(
  {
    name: 'flagAnomalousContributionsFlow',
    inputSchema: FlagAnomalousContributionsInputSchema,
    outputSchema: FlagAnomalousContributionsOutputSchema,
  },
  async input => {
    const {output} = await flagAnomalousContributionsPrompt(input);
    return output!;
  }
);
