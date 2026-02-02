
'use client';

import React from 'react';
import type { Contribution, WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface FinancialStatementProps {
  contributions: Contribution[];
  welfareRequests: WelfareRequest[];
}

type MonthlySummary = {
  month: string;
  year: number;
  totalContributions: number;
  totalDisbursed: number;
  netChange: number;
  contributions: Contribution[];
  disbursements: WelfareRequest[];
};

export function FinancialStatement({ contributions, welfareRequests }: FinancialStatementProps) {
  const handlePrint = () => {
    window.print();
  };

  const processData = (): Record<string, MonthlySummary> => {
    const monthlyData: Record<string, MonthlySummary> = {};
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    contributions.forEach(c => {
      const date = new Date(c.date);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${monthIndex}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: monthNames[monthIndex],
          year: year,
          totalContributions: 0,
          totalDisbursed: 0,
          netChange: 0,
          contributions: [],
          disbursements: []
        };
      }
      monthlyData[key].totalContributions += c.amount;
      monthlyData[key].contributions.push(c);
    });

    welfareRequests.forEach(r => {
      if (r.status !== 'Disbursed') return;
      const date = new Date(r.requestDate);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${monthIndex}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = {
            month: monthNames[monthIndex],
            year: year,
            totalContributions: 0,
            totalDisbursed: 0,
            netChange: 0,
            contributions: [],
            disbursements: []
        };
      }
      monthlyData[key].totalDisbursed += r.amount;
      monthlyData[key].disbursements.push(r);
    });

    Object.keys(monthlyData).forEach(key => {
        monthlyData[key].netChange = monthlyData[key].totalContributions - monthlyData[key].totalDisbursed;
    });

    return monthlyData;
  };
  
  const yearlySummary = (summaries: MonthlySummary[]) => {
      const totalContributions = summaries.reduce((acc, s) => acc + s.totalContributions, 0);
      const totalDisbursed = summaries.reduce((acc, s) => acc + s.totalDisbursed, 0);
      const netChange = totalContributions - totalDisbursed;
      return { totalContributions, totalDisbursed, netChange };
  }

  const dataByMonth = processData();
  const sortedMonths = Object.values(dataByMonth).sort((a,b) => b.year - a.year || a.month.localeCompare(b.month, undefined, {numeric: true}));

  const dataByYear: Record<number, MonthlySummary[]> = {};
  sortedMonths.forEach(monthData => {
      if (!dataByYear[monthData.year]) {
          dataByYear[monthData.year] = [];
      }
      dataByYear[monthData.year].push(monthData);
  });

  const sortedYears = Object.keys(dataByYear).map(Number).sort((a,b) => b - a);


  return (
    <Card className="printable-area">
      <CardHeader className="no-print">
            <div className="flex justify-between items-center">
            <CardTitle>Financial Statements</CardTitle>
            <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="hidden print:block text-2xl font-bold mb-4">
            WelfareWise Financial Statements
        </div>
        <Accordion type="single" collapsible className="w-full" defaultValue={`year-${sortedYears[0]}`}>
            {sortedYears.map(year => {
                const yearData = dataByYear[year];
                const summary = yearlySummary(yearData);
                return (
                    <AccordionItem value={`year-${year}`} key={year}>
                        <AccordionTrigger className="text-lg font-medium accordion-trigger-print">
                            Yearly Statement for {year}
                        </AccordionTrigger>
                        <AccordionContent className="accordion-content-print">
                            <div className="p-4 border rounded-lg print:border-none print:p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Summary for {year}</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Total Contributions</TableCell>
                                            <TableCell className="text-right text-green-600">{formatCurrency(summary.totalContributions)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total Disbursements</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(summary.totalDisbursed)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="font-bold">Net Change</TableCell>
                                            <TableCell className={`text-right font-bold ${summary.netChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(summary.netChange)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                                
                                <Accordion type="multiple" className="w-full mt-4">
                                    {yearData.map(monthlySummary => (
                                        <AccordionItem value={`${year}-${monthlySummary.month}`} key={`${year}-${monthlySummary.month}`}>
                                            <AccordionTrigger className="accordion-trigger-print">{monthlySummary.month} {monthlySummary.year}</AccordionTrigger>
                                            <AccordionContent className="accordion-content-print">
                                                <h4 className="font-semibold mb-2">Contributions</h4>
                                                {monthlySummary.contributions.length > 0 ? (
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {monthlySummary.contributions.map(c => <TableRow key={c.id}><TableCell>{c.memberName}</TableCell><TableCell>{new Date(c.date).toLocaleDateString()}</TableCell><TableCell className="text-right">{formatCurrency(c.amount)}</TableCell></TableRow>)}
                                                        </TableBody>
                                                        <TableFooter><TableRow><TableCell colSpan={2}>Month Total</TableCell><TableCell className="text-right font-bold">{formatCurrency(monthlySummary.totalContributions)}</TableCell></TableRow></TableFooter>
                                                    </Table>
                                                ) : <p className="text-sm text-muted-foreground">No contributions this month.</p>}

                                                <h4 className="font-semibold mt-4 mb-2">Disbursements</h4>
                                                {monthlySummary.disbursements.length > 0 ? (
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Date</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {monthlySummary.disbursements.map(r => <TableRow key={r.id}><TableCell>{r.memberName}</TableCell><TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell><TableCell>{r.reason}</TableCell><TableCell className="text-right">{formatCurrency(r.amount)}</TableCell></TableRow>)}
                                                        </TableBody>
                                                        <TableFooter><TableRow><TableCell colSpan={3}>Month Total</TableCell><TableCell className="text-right font-bold">{formatCurrency(monthlySummary.totalDisbursed)}</TableCell></TableRow></TableFooter>
                                                    </Table>
                                                ) : <p className="text-sm text-muted-foreground">No disbursements this month.</p>}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
