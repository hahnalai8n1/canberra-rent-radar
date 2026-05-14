'use client';

import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/useFormStore';
import { calculateMatchScore } from '../lib/algorithm';

interface ResultsListProps {
  initialSuburbs: any[];
}

export default function ResultsList({ initialSuburbs }: ResultsListProps) {
  const preferences = useFormStore();
  const [commuteData, setCommuteData] = useState<Record<string, number | null>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCommuteTimes() {
      setIsLoading(true);

      const suburbNames = initialSuburbs.map((s) => s.title.trim());

      try {
        const res = await fetch('/api/commute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origins: suburbNames,
            destination: preferences.workplace,
            mode: preferences.commuteMode,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error('Commute API error:', errorData);
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        const timesMap: Record<string, number | null> = {};

        if (data.results) {
          data.results.forEach((item: any) => {
            timesMap[item.suburb] =
              item.status === 'OK' && item.durationMinutes !== null
                ? item.durationMinutes
                : null;
          });
        }

        setCommuteData(timesMap);
      } catch (error) {
        console.error('Failed to fetch commute times', error);
        setCommuteData({});
      } finally {
        setIsLoading(false);
      }
    }

    if (initialSuburbs && initialSuburbs.length > 0) {
      fetchCommuteTimes();
    }
  }, [preferences.workplace, preferences.commuteMode, initialSuburbs]);

  const scoredSuburbs = initialSuburbs.map((suburb) => {
    const cleanSuburbName = suburb.title.trim();
    const commuteMinutes = commuteData[cleanSuburbName] ?? null;

    const result = calculateMatchScore(
      suburb.suburbDetails,
      preferences,
      commuteMinutes,
    );

    return {
      ...suburb,
      matchScore: result.score,
      recommendationTier: result.tier,
      summary: result.summary,
      commuteMinutes,
    };
  });

  const sortedSuburbs = scoredSuburbs.sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 border-2 border-dashed border-slate-200 rounded-xl bg-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Calculating live routes via Google Maps...
        </p>
      </div>
    );
  }

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'RECOMMENDED':
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-200">
            ✅ Recommended
          </span>
        );
      case 'MARGINAL':
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-xs font-bold border border-yellow-200">
            ⚠️ Marginal Match
          </span>
        );
      case 'OUT_OF_BUDGET':
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-bold border border-red-200">
            ❌ Out of Budget
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold border border-slate-200">
            Poor Match
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-2">
        <h2 className="text-xl font-bold text-slate-800">Matching Suburbs</h2>
        <span className="text-sm text-slate-500 font-medium">
          Found {sortedSuburbs.length} results
        </span>
      </div>

      {sortedSuburbs.map((suburb: any, index: number) => {
        const isPoor =
          suburb.recommendationTier === 'POOR_MATCH' ||
          suburb.recommendationTier === 'OUT_OF_BUDGET';

        return (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between gap-6 transition-all duration-300 ${
              isPoor
                ? 'opacity-70 bg-slate-50 border-slate-200'
                : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-300'
            }`}
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  {suburb.title}
                </h3>
                {renderTierBadge(suburb.recommendationTier)}
              </div>

              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100">
                  Rent: ${suburb.suburbDetails.weeklyRent}/wk
                </span>

                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">
                  Commute:{' '}
                  {suburb.commuteMinutes === null
                    ? 'N/A'
                    : `${suburb.commuteMinutes} mins`}
                </span>

                {suburb.suburbDetails.vibe && (
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md border border-purple-100">
                    Vibe:{' '}
                    {Array.isArray(suburb.suburbDetails.vibe)
                      ? suburb.suburbDetails.vibe.join(', ')
                      : suburb.suburbDetails.vibe}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Why this match?
                </h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  {suburb.summary.map((line: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center min-w-[120px] bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Match
              </span>
              <div
                className={`text-5xl font-black ${
                  suburb.matchScore >= 80
                    ? 'text-green-500'
                    : suburb.matchScore >= 50
                      ? 'text-yellow-500'
                      : 'text-slate-300'
                }`}
              >
                {suburb.matchScore}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
